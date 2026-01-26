import { Send } from "lucide-react";
import { useState } from "react";

export function ChatArea() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: string }>>([
    { id: 1, text: "Hey, can you hear me?", sender: "John" },
    { id: 2, text: "Yeah, loud and clear!", sender: "You" },
    { id: 3, text: "Great! Let's start", sender: "Sarah" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: input, sender: "You" }]);
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 p-4">
      <h3 className="text-gray-100 font-semibold mb-4 text-lg">Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sender === "You" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
              }`}
            >
              <p className="text-xs font-semibold opacity-70">{msg.sender}</p>
              <p className="text-sm">{msg.text}</p>
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