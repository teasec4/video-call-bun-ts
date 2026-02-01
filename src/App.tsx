import { ChatArea } from "./components/chatArea";
import { VideoArea } from "./components/videoArea";
import { RoomControl } from "./components/roomControl";
import { useEffect, useRef, useState, useCallback } from "react";
import "./index.css";

type Message = {
  type: string;
  from: string;
  payload: string;
}

type WebRTCCallback = {
  onOffer: (offer: RTCSessionDescriptionInit) => void;
  onAnswer: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onCallEnded: () => void;
}

export function App() {
  const [chatOpen, setChatOpen] = useState(true);
  const [msg, setMsg] = useState<Message[]>([])
  const [err, setErr] = useState("")
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room");
  })
  const [id, setId] = useState(() => {
    const saved = localStorage.getItem("peerId")
    return saved || crypto.randomUUID()
  })
  
  useEffect(() => {
    localStorage.setItem("peerId", id)
  }, [id])
  
  const wsRef = useRef<WebSocket | null>(null)
  const webrtcCallbackRef = useRef<WebRTCCallback | null>(null)
  
  useEffect(() => {
    if (!roomId) return;
    
    setErr("")
    wsRef.current = new WebSocket(
      `ws://localhost:3030/chat?peerId=${encodeURIComponent(id)}&roomId=${encodeURIComponent(roomId)}`
    );
    console.log(`Connected to room ${roomId}`)
    
    wsRef.current.onopen = () => {
      console.log("connected to server")
    }
    
    wsRef.current.onmessage = (event) => {
       console.log("recive a message ", event.data)
       const resivedMsg = JSON.parse(event.data.toString())
       console.log("Message type:", resivedMsg.type, resivedMsg)
       
      // Комната закрыта - вернуться на начальный экран
      if (resivedMsg.type === "room-closed") {
        console.log("Room closed:", resivedMsg.reason)
        setRoomId(null)
        setRemotePeerId(null)
        setMsg([])
      }
      // История сообщений при подключении
      else if (resivedMsg.type === "message-history") {
        console.log("Received message history:", resivedMsg.messages)
        setMsg(resivedMsg.messages.filter((m: any) => m.type === "chat"))
      }
      // Сообщение о подключении второго пира
      else if (resivedMsg.type === "peer-connected") {
        console.log("Remote peer connected:", resivedMsg.peerId)
        setRemotePeerId(resivedMsg.peerId)
      }
      // Обработка WebRTC сообщений
      else if (resivedMsg.type === "offer" && webrtcCallbackRef.current) {
         console.log("Got offer", resivedMsg.payload)
         webrtcCallbackRef.current.onOffer(resivedMsg.payload)
       } else if (resivedMsg.type === "answer" && webrtcCallbackRef.current) {
         console.log("Got answer", resivedMsg.payload)
         webrtcCallbackRef.current.onAnswer(resivedMsg.payload)
       } else if (resivedMsg.type === "ice-candidate" && webrtcCallbackRef.current) {
         console.log("Got ICE candidate", resivedMsg.payload)
         webrtcCallbackRef.current.onIceCandidate(resivedMsg.payload)
       } else if (resivedMsg.type === "chat") {
         // Только добавляем сообщения типа "chat" в историю
         setMsg(prevMsg => [...prevMsg, resivedMsg])
       }
     }
    
    wsRef.current.onclose = () => {
      console.log("connection closed")
    }
    
    wsRef.current.onerror = (err) => {
      console.log("ws error:", err)
      setErr(err.toString())
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    
  }, [roomId, id])
  
  
  const handleSendMessage = (text: string) => {
    const sendingMessage: Message = {
      type: "chat",
      from: id,
      payload:text
    }
    wsRef.current?.send(JSON.stringify(sendingMessage))
  }

  if (!roomId) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
        <RoomControl
          roomId={null}
          onRoomCreated={setRoomId}
          onJoinRoom={setRoomId}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-850 flex overflow-hidden">
      {/* Video Area */}
       <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? "w-2/3" : "w-full"}`}>
         <VideoArea 
           onToggleChat={() => setChatOpen(!chatOpen)} 
           chatOpen={chatOpen} 
           roomId={roomId}
           peerId={id}
           remotePeerId={remotePeerId}
           wsRef={wsRef}
           webrtcCallbackRef={webrtcCallbackRef}
         />
       </div>

      {/* Chat Sidebar */}
      <div
        className={`bg-gray-800 border-l border-gray-700 transition-all duration-300 overflow-hidden ${
          chatOpen ? "w-1/3" : "w-0"
        }`}
      >
        {chatOpen &&
          <ChatArea
            messages={msg}
            onSendMessage={handleSendMessage}
            myId={id}
          />
        }
      </div>
    </div>
  );
}

export default App;
