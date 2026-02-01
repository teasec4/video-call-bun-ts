import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface RoomBadgeProps {
  roomId: string;
}

export function RoomBadge({ roomId }: RoomBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-4 left-4 bg-gray-900 border border-gray-600 rounded-lg p-4 z-20 max-w-sm">
      <p className="text-xs text-gray-400 mb-2 font-semibold">Share Room Code:</p>
      <div className="flex items-center justify-between gap-2 bg-gray-800 p-2 rounded mb-2">
        <p className="text-sm text-white font-mono break-all flex-1">{roomId}</p>
        <button
          onClick={copyRoomId}
          className="flex-shrink-0 p-1.5 hover:bg-gray-700 rounded transition"
          title="Copy room code"
        >
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-gray-400" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Other person: paste code in join field on login screen
      </p>
    </div>
  );
}
