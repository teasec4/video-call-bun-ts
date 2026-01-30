import { ChatArea } from "./components/chatArea";
import { VideoArea } from "./components/videoArea";
import { useEffect, useRef, useState } from "react";
import "./index.css";

type Message = {
  type: string;
  from: string;
  payload: string;
}

export function App() {
  const [chatOpen, setChatOpen] = useState(true);
  const [msg, setMsg] = useState<Message[]>([])
  const [err, setErr] = useState("")
  const [id, setId] = useState(crypto.randomUUID())
  const wsRef = useRef<WebSocket | null>(null)
  
  useEffect(() => {
    setErr("")
    setMsg([])
    wsRef.current = new WebSocket(
      `ws://localhost:3030/chat?peerId=${encodeURIComponent(id)}`
    );
    console.log(`${encodeURIComponent(id)}`)
    
    wsRef.current.onopen = () => {
      console.log("connected to server")
    }
    
    wsRef.current.onmessage = (event) => {
      console.log("recive a message ", event.data)
      const resivedMsg = JSON.parse(event.data.toString())
      console.log(resivedMsg)
      setMsg(prevMsg => [...prevMsg, resivedMsg])
    }
    
    wsRef.current.onclose = () => {
      console.log("connection closed")
    }
    
    wsRef.current.onerror = (err) => {
      console.log("ws error:", err)
      setErr(err.toString())
    }
    
  }, [])
  
  
  const handleSendMessage = (text: string) => {
    const sendingMessage: Message = {
      type: "chat",
      from: id,
      payload:text
    }
    wsRef.current?.send(JSON.stringify(sendingMessage))
  }

  return (
    <div className="w-screen h-screen bg-gray-850 flex overflow-hidden">
      {/* Video Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? "w-2/3" : "w-full"}`}>
        <VideoArea onToggleChat={() => setChatOpen(!chatOpen)} chatOpen={chatOpen} />
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
