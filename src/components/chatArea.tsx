import { Send } from "lucide-react";
import { useState } from "react";
import { COLORS, COLOR_PATTERNS } from "../config/colors";

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
    <div className={`w-full h-full flex flex-col ${COLORS.bg.secondary} p-4`}>
      <h3 className={`${COLORS.text.primary} font-semibold mb-4 text-lg`}>Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, index) => (
          <div key={`${msg.from}-${index}`} className={`flex ${msg.from === myId ? "justify-end" : "justify-start"} items-start`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.from === myId 
                  ? `${COLORS.bg.tertiary} ${COLORS.text.primary}` 
                  : `${COLORS.bg.secondary} ${COLORS.text.secondary}`
              }`}
            >
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
          className={`flex-1 ${COLORS.bg.tertiary} ${COLORS.text.primary} rounded px-3 py-2 text-sm border ${COLORS.border.primary} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        />
        <button
          onClick={handleSend}
          className={`${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary} px-4 py-2 rounded transition`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}