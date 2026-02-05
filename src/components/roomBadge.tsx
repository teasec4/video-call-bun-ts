import { Copy, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { colorStyles } from "../config/styles";
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
    <div style={{...colorStyles.bgPrimary, borderColor: 'var(--bd-primary)'}} className="absolute top-4 left-4 border rounded-lg p-4 z-20 max-w-sm">
      <p style={colorStyles.textMuted} className="text-xs mb-2 font-semibold">Share Room Code:</p>
      <div style={colorStyles.bgSecondary} className="flex items-center justify-between gap-2 p-2 rounded mb-2">
        <p style={colorStyles.textPrimary} className="text-sm font-mono break-all flex-1">{roomId}</p>
        <button
          onClick={copyRoomId}
          className="flex-shrink-0 p-1.5 rounded transition hover:opacity-80"
          title="Copy room code"
        >
          {copied ? (
            <Check size={16} style={{color: 'var(--st-success)'}} />
          ) : (
            <Copy size={16} style={colorStyles.textMuted} />
          )}
        </button>
      </div>
      <p style={colorStyles.textDisabled} className="text-xs">
        Other person: paste code in join field on login screen
      </p>
    </div>
  );
}
