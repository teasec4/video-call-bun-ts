import { X, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { colorStyles, createButtonHoverHandler } from "../config/styles";
import { DELAYS } from "../config/constants";

type RoomInfoProps = {
  roomId: string;
  peerId: string;
  remotePeerId: string | null;
  onClose?: () => void;
};

export function RoomInfo({ roomId, peerId, remotePeerId, onClose }: RoomInfoProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), DELAYS.COPY_FEEDBACK) as unknown as number;
    } catch (err) {
      console.error("❌ Failed to copy:", err);
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), DELAYS.COPY_FEEDBACK) as unknown as number;
      } catch (fallbackErr) {
        console.error("❌ Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div style={{...colorStyles.bgSecondary, borderRightColor: 'var(--bd-primary)'}} className="w-80 border-r flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 style={colorStyles.textPrimary} className="font-semibold text-lg">Room Info</h2>
        <button
          onClick={onClose}
          style={colorStyles.textMuted}
          className="transition hover:opacity-80"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p style={colorStyles.textMuted} className="text-xs uppercase tracking-wide mb-2">Room ID</p>
          <div className="flex gap-2">
            <code style={{...colorStyles.bgTertiary, ...colorStyles.textPrimary}} className="flex-1 px-3 py-2 rounded text-xs font-mono break-all">
              {roomId}
            </code>
            <button
              onClick={handleCopy}
              style={colorStyles.buttonPrimary}
              {...createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)')}
              className="p-2 rounded transition"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <p style={colorStyles.textMuted} className="text-xs uppercase tracking-wide mb-2">Your ID</p>
          <code style={{...colorStyles.bgTertiary, ...colorStyles.textPrimary}} className="px-3 py-2 rounded text-xs font-mono break-all block">
            {peerId}
          </code>
        </div>

        <div>
          <p style={colorStyles.textMuted} className="text-xs uppercase tracking-wide mb-2">Connected Peer</p>
          {remotePeerId ? (
            <code style={{...colorStyles.bgTertiary, ...colorStyles.textPrimary}} className="px-3 py-2 rounded text-xs font-mono break-all block">
              {remotePeerId}
            </code>
          ) : (
            <p style={colorStyles.textMuted} className="text-sm italic">Waiting for peer...</p>
          )}
        </div>

        <div>
          <p style={colorStyles.textMuted} className="text-xs uppercase tracking-wide mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className={clsx('w-2 h-2 rounded-full', remotePeerId ? 'bg-green-500' : 'bg-yellow-500')} />
            <p style={colorStyles.textPrimary}>
              {remotePeerId ? "Connected" : "Waiting"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
