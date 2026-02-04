import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { COLORS } from "../config/colors";
import { DELAYS } from "../config/constants";

interface RoomBadgeProps {
  roomId: string;
}

export function RoomBadge({ roomId }: RoomBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), DELAYS.COPY_FEEDBACK);
  };

  return (
    <div className={`absolute top-4 left-4 ${COLORS.bg.primary} border ${COLORS.border.primary} rounded-lg p-4 z-20 max-w-sm`}>
      <p className={`text-xs ${COLORS.text.muted} mb-2 font-semibold`}>Share Room Code:</p>
      <div className={`flex items-center justify-between gap-2 ${COLORS.bg.secondary} p-2 rounded mb-2`}>
        <p className={`text-sm ${COLORS.text.primary} font-mono break-all flex-1`}>{roomId}</p>
        <button
          onClick={copyRoomId}
          className={`flex-shrink-0 p-1.5 hover:${COLORS.bg.tertiary} rounded transition`}
          title="Copy room code"
        >
          {copied ? (
            <Check size={16} className={COLORS.status.success} />
          ) : (
            <Copy size={16} className={COLORS.text.muted} />
          )}
        </button>
      </div>
      <p className={`text-xs ${COLORS.text.disabled}`}>
        Other person: paste code in join field on login screen
      </p>
    </div>
  );
}
