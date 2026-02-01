import { PhoneOff, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RoomBadge } from "./roomBadge";

interface VideoAreaProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  roomId: string;
  peerId: string;
  remotePeerId: string | null;
  wsRef: React.MutableRefObject<WebSocket | null>;
  webrtcCallbackRef: React.MutableRefObject<{
    onOffer: (offer: RTCSessionDescriptionInit) => void;
    onAnswer: (answer: RTCSessionDescriptionInit) => void;
    onIceCandidate: (candidate: RTCIceCandidateInit) => void;
    onCallEnded: () => void;
  } | null>;
}

export function VideoArea({ onToggleChat, chatOpen, roomId, peerId, remotePeerId, wsRef, webrtcCallbackRef }: VideoAreaProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // Получить список камер
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
      return videoDevices;
    } catch (err) {
      console.error("Failed to enumerate devices:", err);
      return [];
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const initializeLocalStream = async (cameraId?: string, autoCall: boolean = false) => {
    try {
      const constraints: any = {
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Если указана конкретная камера, используем ее
      if (cameraId) {
        constraints.video.deviceId = { exact: cameraId };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setShowCameraSelect(false);

      // Если это первое подключение и есть удаленный пир, начни звонок
      if (autoCall && remotePeerId && !isCalling) {
        await handleStartCall(remotePeerId);
      }

      return stream;
    } catch (err) {
      console.error("Failed to get media devices:", err);
      alert("Allow camera and microphone access");
    }
  };

  const setupPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    console.log("Adding local tracks to peer connection:");
    stream.getTracks().forEach((track) => {
      console.log(`Adding track: ${track.kind} - ${track.id}`);
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind, event.track.id);
      console.log("Streams:", event.streams);
      if (remoteVideoRef.current && event.streams[0]) {
        console.log("Setting remote video source");
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to room");
        if (wsRef.current) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              payload: event.candidate,
            })
          );
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        handleHangup();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
    };

    pcRef.current = pc;
    return pc;
  };

  const handleStartCall = async (targetPeerId?: string) => {
     if (!localStreamRef.current) {
       const stream = await initializeLocalStream(selectedCameraId);
       if (!stream) return;
     }

     setIsCalling(true);
     const pc = setupPeerConnection(localStreamRef.current!);

     try {
       console.log("Creating offer for peer:", targetPeerId);
       const offer = await pc.createOffer();
       console.log("Offer created:", offer);
       await pc.setLocalDescription(offer);
       console.log("Local description set");

       if (wsRef.current) {
         const msg: any = {
           type: "offer",
           payload: offer,
         };
         if (targetPeerId) {
           msg.to = targetPeerId;
         }
         console.log("Sending offer:", msg);
         wsRef.current.send(JSON.stringify(msg));
       }
     } catch (err) {
       console.error("Failed to create offer:", err);
       setIsCalling(false);
     }
   };

  const handleHangup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsCalling(false);
    setCallActive(false);

    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "call-ended",
          payload: {},
        })
      );
    }
  };

  useEffect(() => {
    // Регистрируем callbacks в родительском компоненте
    webrtcCallbackRef.current = {
      onOffer: handleIncomingOffer,
      onAnswer: handleIncomingAnswer,
      onIceCandidate: handleIceCandidate,
      onCallEnded: handleHangup,
    };

    return () => {
      webrtcCallbackRef.current = null;
    };
  }, []);

  // Показать выбор камеры при подключении второго пира
  useEffect(() => {
    if (remotePeerId && !isCalling && !callActive && cameras.length > 0) {
      console.log("Peer connected, showing camera selector");
      setShowCameraSelect(true);
    }
  }, [remotePeerId, cameras]);

  const handleIncomingOffer = async (offer: RTCSessionDescriptionInit & { from?: string }) => {
    console.log("Received offer from:", offer.from, offer);
    if (!localStreamRef.current) {
      const stream = await initializeLocalStream(selectedCameraId);
      if (!stream) return;
    }

    const pc = setupPeerConnection(localStreamRef.current!);
    setIsCalling(true);

    try {
      console.log("Setting remote description (offer)");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("Remote description set");
      
      // Обрабатываем очередь ICE кандидатов после установления remote description
      await processIceCandidateQueue();
      
      console.log("Creating answer");
      const answer = await pc.createAnswer();
      console.log("Answer created:", answer);
      await pc.setLocalDescription(answer);
      console.log("Local description set (answer)");

      if (wsRef.current && offer.from) {
        console.log("Sending answer to:", offer.from);
        wsRef.current.send(
          JSON.stringify({
            type: "answer",
            to: offer.from,
            payload: answer,
          })
        );
      }
      setCallActive(true);
    } catch (err) {
      console.error("Failed to handle offer:", err);
    }
  };

  const handleIncomingAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log("Received answer:", answer);
    if (pcRef.current) {
      try {
        console.log("Setting remote description (answer)");
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set (answer)");
        // Обрабатываем очередь ICE кандидатов после установления remote description
        await processIceCandidateQueue();
        console.log("ICE queue processed");
        setCallActive(true);
      } catch (err) {
        console.error("Failed to handle answer:", err);
      }
    } else {
      console.error("PC not initialized when handling answer");
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current) {
      console.log("PC not initialized, queueing ICE candidate");
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    try {
      // Если remote description не установлена, добавляем в очередь
      if (pcRef.current.remoteDescription === null) {
        console.log("Remote description not set, queueing ICE candidate");
        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    } catch (err) {
      console.error("Failed to add ICE candidate:", err);
    }
  };

  // Функция для обработки очереди ICE кандидатов
  const processIceCandidateQueue = async () => {
    if (!pcRef.current || pcRef.current.remoteDescription === null) {
      return;
    }

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      if (candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Queued ICE candidate added");
        } catch (err) {
          console.error("Failed to add queued ICE candidate:", err);
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Room Badge */}
      <RoomBadge roomId={roomId} />

      {/* Camera Selector Modal */}
      {showCameraSelect && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Select Camera</h2>
            <div className="space-y-2 mb-4">
              {cameras.map((camera) => (
                <button
                  key={camera.deviceId}
                  onClick={() => setSelectedCameraId(camera.deviceId)}
                  className={`w-full p-3 rounded text-left transition ${
                    selectedCameraId === camera.deviceId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => initializeLocalStream(selectedCameraId, true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
            >
              Start Call
            </button>
          </div>
        </div>
      )}
      
      {/* Main Video Grid */}
      <div className="flex-1 bg-gray-800 relative grid grid-cols-2 gap-2 p-4 overflow-hidden">
        {/* Local Video */}
         <div className="relative bg-gray-900 rounded overflow-hidden">
           <video
             ref={localVideoRef}
             autoPlay
             playsInline
             muted
             className="w-full h-full object-contain bg-black"
           />
           <div className="absolute bottom-2 left-2 bg-gray-900 px-2 py-1 rounded text-xs text-gray-300">
             You
           </div>
         </div>

         {/* Remote Video */}
         <div className="relative bg-gray-900 rounded overflow-hidden">
           {isCalling || callActive ? (
             <video
               ref={remoteVideoRef}
               autoPlay
               playsInline
               className="w-full h-full object-contain bg-black"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500">
               <p>Waiting for peer connection...</p>
             </div>
           )}
           {callActive && (
             <div className="absolute bottom-2 left-2 bg-gray-900 px-2 py-1 rounded text-xs text-gray-300">
               Remote
             </div>
           )}
         </div>

        {/* Toggle Chat Button */}
        <button
          onClick={onToggleChat}
          className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-10 ${
            chatOpen
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 py-6 bg-gray-800 border-t border-gray-700">
        {!remotePeerId ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded text-gray-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Waiting for peer...</span>
          </div>
        ) : isCalling ? (
          <button
            onClick={handleHangup}
            className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-red-600/50"
            title="End call"
          >
            <PhoneOff size={28} />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Initializing call...</span>
          </div>
        )}
      </div>
    </div>
  );
}