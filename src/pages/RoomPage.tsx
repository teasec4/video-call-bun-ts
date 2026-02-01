import { useParams, useNavigate } from "react-router-dom";
import { ChatArea } from "../components/chatArea";
import { VideoArea } from "../components/videoArea";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useEffect, useState, useCallback, useRef } from "react";
import type { SignalingMessage } from "../types/webrtc";

type Message = {
  type: string;
  from: string;
  payload: string;
};

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(true);
  const [msg, setMsg] = useState<Message[]>([]);
  const [id] = useState(() => {
    const saved = localStorage.getItem("peerId");
    return saved || crypto.randomUUID();
  });

  useEffect(() => {
    localStorage.setItem("peerId", id);
  }, [id]);

  // Ref для хранения webrtc методов
  const webrtcRef = useRef<ReturnType<typeof useWebRTC> | null>(null);

  // Мемоизируем callbacks для WebSocket
  const handleWebSocketMessage = useCallback((message: SignalingMessage) => {
    // Обработка чата
    if (message.type === "chat") {
      setMsg((prevMsg) => [...prevMsg, message as Message]);
    }
    // Обработка истории сообщений
    else if (message.type === "message-history" && message.messages) {
      setMsg(message.messages.filter((m: any) => m.type === "chat"));
    }
    // Обработка WebRTC сообщений
    else if (message.type === "offer" && message.from && message.payload && webrtcRef.current) {
      webrtcRef.current.handleOffer({ ...message.payload, from: message.from });
    } else if (message.type === "answer" && message.from && message.payload && webrtcRef.current) {
      webrtcRef.current.handleAnswer({ ...message.payload, from: message.from });
    } else if (message.type === "ice-candidate" && message.payload && webrtcRef.current) {
      webrtcRef.current.handleIceCandidate(message.payload);
    } else if (message.type === "hang-up" && webrtcRef.current) {
      webrtcRef.current.hangup();
    }
  }, []);

  const handlePeerConnected = useCallback((peerId: string) => {
    console.log("🤝 Peer connected:", peerId);
    // Автоматически начинаем звонок когда подключается пир
    if (webrtcRef.current && !webrtcRef.current.webrtcState.isCalling && !webrtcRef.current.webrtcState.callActive) {
      webrtcRef.current.startCall(peerId);
    }
  }, []);

  const handleRoomClosed = useCallback((reason: string) => {
    console.log("Room closed:", reason);
    navigate("/");
  }, [navigate]);

  // WebSocket хук
  const { remotePeerId, send: sendWS } = useWebSocket({
    roomId: roomId!,
    peerId: id,
    onMessage: handleWebSocketMessage,
    onPeerConnected: handlePeerConnected,
    onRoomClosed: handleRoomClosed,
  });

  // WebRTC хук - создаем после получения sendWS
  const handleSendSignaling = useCallback((message: { type: string; to?: string; payload?: any }) => {
    sendWS(message);
  }, [sendWS]);

  const webrtc = useWebRTC({
    remotePeerId, // Используем remotePeerId из WebSocket
    onSendSignaling: handleSendSignaling,
    onRemoteStream: useCallback((stream: MediaStream) => {
      console.log("✅ Remote stream received:", stream);
    }, []),
  });

  // Сохраняем webrtc в ref - обновляем при изменении методов
  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  const handleSendMessage = useCallback((text: string) => {
    sendWS({
      type: "chat",
      payload: text,
    });
  }, [sendWS]);

  if (!roomId) {
    return <div>Room ID is required</div>;
  }

  return (
    <div className="w-screen h-screen bg-gray-850 flex overflow-hidden">
      {/* Video Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 h-full min-h-0 ${
          chatOpen ? "w-2/3" : "w-full"
        }`}
      >
        <VideoArea
          onToggleChat={() => setChatOpen(!chatOpen)}
          chatOpen={chatOpen}
          roomId={roomId}
          peerId={id}
          remotePeerId={remotePeerId}
          webrtc={webrtc}
        />
      </div>

      {/* Chat Sidebar */}
      <div
        className={`bg-gray-800 border-l border-gray-700 transition-all duration-300 overflow-hidden ${
          chatOpen ? "w-1/3" : "w-0"
        }`}
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
