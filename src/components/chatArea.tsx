import { Send } from "lucide-react";
import { useState } from "react";

type Message = {
  type: string;
  from: string;
  payload: string;
};

type ChatAreaProps = {
  messages: Message[];
  onSendMessage: (text: string) => void;
  myId: string;
};

export function ChatArea({messages, onSendMessage, myId} : ChatAreaProps) {
  
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 p-4">
      <h3 className="text-gray-100 font-semibold mb-4 text-lg">Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, index) => (
          // do we need a Key?
          <div key={index} className={`flex ${msg.from === myId ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.from === myId ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
              }`}
            >
              <p className="text-xs font-semibold opacity-70">{msg.from}</p>
              <p className="text-sm">{msg.payload}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-gray-100 rounded px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}