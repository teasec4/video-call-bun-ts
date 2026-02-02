import { PhoneOff, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoAreaProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  roomId: string;
  peerId: string;
  remotePeerId: string | null;
  webrtc: ReturnType<typeof import("../hooks/useWebRTC").useWebRTC>;
}

export function VideoArea({ 
  onToggleChat, 
  chatOpen, 
  roomId, 
  peerId, 
  remotePeerId, 
  webrtc 
}: VideoAreaProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [showCameraPanel, setShowCameraPanel] = useState(false);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showRoomInfo, setShowRoomInfo] = useState(true);

  // Инициализация локального потока при монтировании
  useEffect(() => {
    if (!webrtc.mediaState.localStream) {
      webrtc.initializeLocalStream(webrtc.mediaState.selectedCameraId).catch((err) => {
        console.error("Failed to initialize local stream:", err);
        alert("Allow camera and microphone access");
      });
    }
    // Загружаем список камер при монтировании
    if (webrtc.mediaState.cameras.length === 0) {
      webrtc.getCameras();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Только при монтировании

  // Обновление локального видео элемента
  useEffect(() => {
    if (localVideoRef.current && webrtc.mediaState.localStream) {
      localVideoRef.current.srcObject = webrtc.mediaState.localStream;
    }
  }, [webrtc.mediaState.localStream]);

  // Переподключение видео при разворачивании минимизированного окна
  useEffect(() => {
    if (showLocalVideo && localVideoRef.current && webrtc.mediaState.localStream) {
      localVideoRef.current.srcObject = webrtc.mediaState.localStream;
      console.log("🎥 Restored local video stream");
    }
  }, [showLocalVideo, webrtc.mediaState.localStream]);

  // Обновление удаленного видео элемента
  useEffect(() => {
    if (remoteVideoRef.current && webrtc.mediaState.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.mediaState.remoteStream;
    }
  }, [webrtc.mediaState.remoteStream]);

  // Убрали автоматический звонок отсюда - он обрабатывается в RoomPage через handlePeerConnected

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-black">
        {webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-contain"
            onLoadedMetadata={() => console.log("✅ Remote video metadata loaded")}
            onPlay={() => console.log("✅ Remote video playing")}
            onCanPlay={() => console.log("✅ Remote video can play")}
            onError={(e) => console.error("❌ Remote video error:", e)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>Waiting for peer connection...</p>
          </div>
        )}
        
        {showLocalVideo && webrtc.mediaState.localStream && (
          <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-800 rounded-lg shadow-lg border-2 border-gray-700 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />
            <button
              onClick={() => setShowLocalVideo(false)}
              className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 w-6 h-6 rounded flex items-center justify-center text-xs text-gray-300"
              title="Minimize"
            >
              −
            </button>
          </div>
        )}

        {!showLocalVideo && (
          <button
            onClick={() => setShowLocalVideo(true)}
            className="absolute bottom-6 right-6 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded text-xs"
          >
            Show Local Video
          </button>
        )}

        {showRoomInfo && (
          <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-4 py-3 rounded-lg border border-gray-700 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                ℹ️ Room Info
              </p>
              <button
                onClick={() => setShowRoomInfo(false)}
                className="text-gray-400 hover:text-gray-300 transition"
                title="Collapse"
              >
                ▼
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-xs">Room ID:</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white font-mono text-xs break-all flex-1">{roomId}</p>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(roomId);
                        console.log("✅ Room ID copied to clipboard");
                      } catch (err) {
                        console.error("❌ Failed to copy:", err);
                        // Fallback для старых браузеров
                        const textArea = document.createElement("textarea");
                        textArea.value = roomId;
                        textArea.style.position = "fixed";
                        textArea.style.opacity = "0";
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                          document.execCommand("copy");
                          console.log("✅ Room ID copied (fallback)");
                        } catch (fallbackErr) {
                          console.error("❌ Fallback copy failed:", fallbackErr);
                        }
                        document.body.removeChild(textArea);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition"
                    title="Copy Room ID"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs">Your ID:</p>
                <p className="text-white font-mono text-xs">{peerId.slice(0, 8)}...</p>
              </div>
              
              {remotePeerId && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    ✓ Peer connected
                  </p>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-400 text-xs">Connection:</p>
                <p className="text-white text-xs">
                  {webrtc.webrtcState.connectionState || "Not connected"}
                </p>
                {webrtc.webrtcState.iceConnectionState && (
                  <p className="text-white text-xs">
                    ICE: {webrtc.webrtcState.iceConnectionState}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!showRoomInfo && (
          <button
            onClick={() => setShowRoomInfo(true)}
            className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded text-lg transition"
            title="Show room info"
          >
            ℹ️
          </button>
        )}

        <button
          onClick={onToggleChat}
          className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-10 ${
            chatOpen
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={24} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-4">
          {!remotePeerId ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 backdrop-blur rounded text-gray-300">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Waiting for peer...</span>
            </div>
          ) : webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur rounded-lg border border-gray-700">
              <button
                onClick={webrtc.toggleVideo}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  webrtc.mediaState.videoEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={webrtc.mediaState.videoEnabled ? "Turn off video" : "Turn on video"}
              >
                {webrtc.mediaState.videoEnabled ? "📹" : "📹‍❌"}
              </button>

              <button
                onClick={webrtc.toggleAudio}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  webrtc.mediaState.audioEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={webrtc.mediaState.audioEnabled ? "Mute" : "Unmute"}
              >
                {webrtc.mediaState.audioEnabled ? "🎤" : "🔇"}
              </button>

              {webrtc.mediaState.cameras.length > 1 && (
                <button
                  onClick={() => setShowCameraPanel(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition text-sm"
                  title="Switch camera"
                >
                  📷 Switch
                </button>
              )}

              <button
                onClick={webrtc.hangup}
                className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-red-600/50"
                title="End call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 backdrop-blur rounded text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Initializing call...</span>
            </div>
          )}
        </div>
      </div>

      {showCameraPanel && (webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive) && webrtc.mediaState.cameras.length > 1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Switch Camera</h2>
            <div className="space-y-2 mb-4">
              {webrtc.mediaState.cameras.map((camera) => (
                <button
                  key={camera.deviceId}
                  onClick={() => {
                    webrtc.switchCamera(camera.deviceId);
                    setShowCameraPanel(false);
                  }}
                  className={`w-full p-3 rounded text-left transition ${
                    webrtc.mediaState.selectedCameraId === camera.deviceId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {camera.label || `Camera ${webrtc.mediaState.cameras.indexOf(camera) + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCameraPanel(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
