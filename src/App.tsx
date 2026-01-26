import { ChatArea } from "./components/chatArea";
import { VideoArea } from "./components/videoArea";
import { useState } from "react";
import "./index.css";

export function App() {
  const [chatOpen, setChatOpen] = useState(true);

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
        {chatOpen && <ChatArea />}
      </div>
    </div>
  );
}

export default App;
