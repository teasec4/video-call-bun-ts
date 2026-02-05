import { Send } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { colorStyles, createButtonHoverHandler } from "../config/styles";

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
    <div style={colorStyles.bgSecondary} className="w-full h-full flex flex-col p-4">
      <h3 style={colorStyles.textPrimary} className="font-semibold mb-4 text-lg">Chat</h3>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, index) => (
          <div key={`${msg.from}-${index}`} className={clsx('flex items-start', msg.from === myId ? 'justify-end' : 'justify-start')}>
            <div
              style={msg.from === myId ? {backgroundColor: 'var(--bg-tertiary)', color: 'var(--txt-primary)'} : {backgroundColor: 'var(--bg-primary)', color: 'var(--txt-secondary)'}}
              className="px-4 py-2 rounded-lg max-w-xs"
            >
              <p className="text-sm">{msg.payload}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={colorStyles.input}
          className="flex-1 rounded px-3 py-2 text-sm border focus:outline-none focus:ring-2"
        />
        <button
          onClick={handleSend}
          style={colorStyles.buttonPrimary}
          {...createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)')}
          className="px-4 py-2 rounded transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
