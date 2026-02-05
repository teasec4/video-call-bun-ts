import { useParams, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ChatArea } from "../components/chatArea";
import { VideoArea } from "../components/videoArea";
import { RoomInfo } from "../components/roomInfo";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useEffect, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { SignalingMessage } from "../types/webrtc";
import { colorStyles } from "../config/styles";
import { DELAYS } from "../config/constants";

type Message = {
  type: string;
  from: string;
  payload: string;
};

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [msg, setMsg] = useState<Message[]>([]);
  const [id] = useState(() => {
    const saved = localStorage.getItem("peerId");
    return saved || uuidv4();
  });
  const webrtcRef = useRef<ReturnType<typeof useWebRTC> | null>(null);
  const disconnectWSRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    localStorage.setItem("peerId", id);
  }, [id]);

  const handleWebSocketMessage = useCallback((message: SignalingMessage) => {
    if (message.type === "chat") {
      console.log(`📨 Chat message from: ${message.from}, myId: ${id}, isMine: ${message.from === id}`);
      if (message.from !== id) {
        setMsg((prevMsg) => [...prevMsg, message as Message]);
      }
    }
    else if (message.type === "message-history" && message.messages) {
      setMsg(message.messages.filter((m: any) => m.type === "chat"));
    }
    else if (message.type === "offer" && message.from && message.payload && webrtcRef.current) {
      webrtcRef.current.handleOffer({ ...message.payload, from: message.from });
    } else if (message.type === "answer" && message.from && message.payload && webrtcRef.current) {
      webrtcRef.current.handleAnswer({ ...message.payload, from: message.from });
    } else if (message.type === "ice-candidate" && message.payload && webrtcRef.current) {
      webrtcRef.current.handleIceCandidate(message.payload);
    } else if (message.type === "hang-up" && webrtcRef.current) {
      console.log("📞 Peer initiated hang-up, closing connection...");
      webrtcRef.current.hangup();
    }
  }, [id]);

  const handlePeerConnected = useCallback((peerId: string) => {
    console.log("🤝 Peer connected:", peerId);
    setTimeout(() => {
      if (webrtcRef.current && !webrtcRef.current.webrtcState.isCalling && !webrtcRef.current.webrtcState.callActive) {
        webrtcRef.current.startCall(peerId);
      }
    }, DELAYS.PEER_CALL_INIT);
  }, []);

  const handleRoomClosed = useCallback((reason: string) => {
    console.log("🚪 Room closed:", reason);
    if (webrtcRef.current) {
      webrtcRef.current.hangup();
    }
    if (disconnectWSRef.current) {
      disconnectWSRef.current();
    }
    setTimeout(() => {
      navigate("/");
    }, DELAYS.ROOM_EXIT);
  }, [navigate]);

  const { remotePeerId, send: sendWS, disconnect: disconnectWS } = useWebSocket({
    roomId: roomId!,
    peerId: id,
    onMessage: handleWebSocketMessage,
    onPeerConnected: handlePeerConnected,
    onRoomClosed: handleRoomClosed,
  });

  useEffect(() => {
    disconnectWSRef.current = disconnectWS;
  }, [disconnectWS]);

  const handleSendSignaling = useCallback((message: { type: string; to?: string; payload?: any }) => {
    sendWS(message);
  }, [sendWS]);

  const webrtc = useWebRTC({
    remotePeerId,
    onSendSignaling: handleSendSignaling,
    onRemoteStream: useCallback((stream: MediaStream) => {
      console.log("✅ Remote stream received:", stream);
    }, []),
  });

  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  const handleSendMessage = useCallback((text: string) => {
    setMsg((prevMsg) => [...prevMsg, {
      type: "chat",
      from: id,
      payload: text,
    }]);
    
    sendWS({
      type: "chat",
      payload: text,
    });
  }, [sendWS, id]);

  const handleToggleChat = useCallback(() => setChatOpen(prev => !prev), []);
  const handleToggleInfo = useCallback(() => setInfoOpen(prev => !prev), []);
  const handleLeaveRoom = useCallback(() => {
    disconnectWSRef.current?.();
    navigate("/");
  }, [navigate]);

  if (!roomId) {
    return <div>Room ID is required</div>;
  }

  return (
    <div style={colorStyles.bgSecondary} className="w-screen h-screen flex overflow-hidden">
      <div
        style={{borderRightColor: 'var(--bd-primary)'}}
        className={clsx(
          'border-r transition-all duration-300 overflow-hidden',
          infoOpen ? 'w-80' : 'w-0'
        )}
      >
        {infoOpen && (
          <RoomInfo
            roomId={roomId!}
            peerId={id}
            remotePeerId={remotePeerId}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </div>

      <div
        className={clsx(
          'flex-1 flex flex-col transition-all duration-300 h-full min-h-0',
          chatOpen ? 'w-2/3' : 'w-full'
        )}
      >
        <VideoArea
           onToggleChat={handleToggleChat}
           onToggleInfo={handleToggleInfo}
           onLeaveRoom={handleLeaveRoom}
           chatOpen={chatOpen}
           infoOpen={infoOpen}
           roomId={roomId}
           peerId={id}
           remotePeerId={remotePeerId}
           webrtc={webrtc}
         />
      </div>

      <div
        style={{borderLeftColor: 'var(--bd-primary)'}}
        className={clsx(
          'border-l transition-all duration-300 overflow-hidden',
          chatOpen ? 'w-1/3' : 'w-0'
        )}
      >
        {chatOpen && (
          <ChatArea
            messages={msg}
            onSendMessage={handleSendMessage}
            myId={id}
          />
        )}
      </div>
    </div>
  );
}
