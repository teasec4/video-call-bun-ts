import { Phone, PhoneOff, MessageSquare } from "lucide-react";

interface VideoAreaProps {
  onToggleChat: () => void;
  chatOpen: boolean;
}

export function VideoArea({ onToggleChat, chatOpen }: VideoAreaProps) {
  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Main Video */}
      <div className="flex-1 bg-gray-800 relative flex items-center justify-center overflow-hidden">
        <div className="text-gray-500 text-center">
          <p className="text-xl">Your video here</p>
        </div>

        {/* Toggle Chat Button - Top Right */}
        <button
          onClick={onToggleChat}
          className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-10 ${
            chatOpen
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 py-6 bg-gray-800 border-t border-gray-700">
        <button className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-green-600/50">
          <Phone size={28} />
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-red-600/50">
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
}