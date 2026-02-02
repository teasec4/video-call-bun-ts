import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { COLORS } from "../config/colors";

type RoomInfoProps = {
  roomId: string;
  peerId: string;
  remotePeerId: string | null;
  onClose?: () => void;
};

export function RoomInfo({ roomId, peerId, remotePeerId, onClose }: RoomInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Failed to copy:", err);
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("❌ Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`w-80 ${COLORS.bg.secondary} border-r ${COLORS.border.primary} flex flex-col h-full p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`${COLORS.text.primary} font-semibold text-lg`}>Room Info</h2>
        <button
          onClick={onClose}
          className={`${COLORS.text.muted} hover:${COLORS.text.primary} transition`}
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Room ID */}
        <div>
          <p className={`${COLORS.text.muted} text-xs uppercase tracking-wide mb-2`}>Room ID</p>
          <div className="flex gap-2">
            <code className={`flex-1 ${COLORS.bg.tertiary} ${COLORS.text.primary} px-3 py-2 rounded text-xs font-mono break-all`}>
              {roomId}
            </code>
            <button
              onClick={handleCopy}
              className={`${COLORS.button.primary} ${COLORS.text.primary} p-2 rounded transition`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Your ID */}
        <div>
          <p className={`${COLORS.text.muted} text-xs uppercase tracking-wide mb-2`}>Your ID</p>
          <code className={`${COLORS.bg.tertiary} ${COLORS.text.primary} px-3 py-2 rounded text-xs font-mono break-all block`}>
            {peerId}
          </code>
        </div>

        {/* Remote Peer */}
        <div>
          <p className={`${COLORS.text.muted} text-xs uppercase tracking-wide mb-2`}>Connected Peer</p>
          {remotePeerId ? (
            <code className={`${COLORS.bg.tertiary} ${COLORS.text.primary} px-3 py-2 rounded text-xs font-mono break-all block`}>
              {remotePeerId}
            </code>
          ) : (
            <p className={`${COLORS.text.muted} text-sm italic`}>Waiting for peer...</p>
          )}
        </div>

        {/* Status */}
        <div>
          <p className={`${COLORS.text.muted} text-xs uppercase tracking-wide mb-2`}>Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${remotePeerId ? "bg-green-500" : "bg-yellow-500"}`} />
            <p className={COLORS.text.primary}>
              {remotePeerId ? "Connected" : "Waiting"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
