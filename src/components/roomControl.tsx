import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { API_URL } from "../config/api";
import { COLORS } from "../config/colors";

interface RoomControlProps {
  roomId: string | null;
  onRoomCreated: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
}

export function RoomControl({ roomId, onRoomCreated, onJoinRoom }: RoomControlProps) {
  const [inputRoomId, setInputRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/room`, {
        method: "POST",
      });
      const data = await response.json();
      onRoomCreated(data.roomId);
    } catch (err) {
      setError("Failed to create room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputRoomId.trim()) {
      setError("Enter room ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const peerId = localStorage.getItem("peerId") || crypto.randomUUID();
      const response = await fetch(`${API_URL}/api/room/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: inputRoomId, peerId }),
      });
      
      if (!response.ok) {
        throw new Error("Room not found");
      }
      
      onJoinRoom(inputRoomId);
    } catch (err) {
      setError("Failed to join room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomLink = () => {
    if (!roomId) return;
    const link = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${COLORS.bg.secondary} rounded-lg border ${COLORS.border.primary}`}>
      <h2 className={`text-xl font-bold ${COLORS.text.primary} mb-6`}>Video Room</h2>

      {roomId ? (
        <div className="space-y-4">
          <div className={`${COLORS.bg.primary} p-4 rounded border ${COLORS.border.secondary}`}>
            <p className={`text-sm ${COLORS.text.muted} mb-2`}>Room ID:</p>
            <p className={`${COLORS.text.primary} font-mono break-all`}>{roomId}</p>
          </div>

          <button
            onClick={copyRoomLink}
            className={`w-full flex items-center justify-center gap-2 ${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary} py-3 rounded-lg transition`}
          >
            {copied ? (
              <>
                <Check size={20} /> Copied!
              </>
            ) : (
              <>
                <Copy size={20} /> Copy Link
              </>
            )}
          </button>

          <p className={`text-sm ${COLORS.text.muted} text-center`}>
            Share the link to invite others to join
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${COLORS.text.muted} mb-2`}>
              Room ID (to join)
            </label>
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="Paste room ID here"
              className={`w-full px-4 py-2 ${COLORS.bg.primary} border ${COLORS.border.primary} rounded ${COLORS.text.primary} placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2`}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className={`w-full ${COLORS.button.secondary} ${COLORS.button.secondaryHover} disabled:${COLORS.bg.tertiary} ${COLORS.text.primary} py-3 rounded-lg transition`}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${COLORS.border.primary}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${COLORS.bg.secondary} ${COLORS.text.muted}`}>or</span>
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className={`w-full ${COLORS.button.primary} ${COLORS.button.primaryHover} disabled:${COLORS.bg.tertiary} ${COLORS.text.primary} py-3 rounded-lg transition`}
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      )}

      {error && (
        <div className={`mt-4 p-3 ${COLORS.status.error} rounded text-sm ${COLORS.text.primary}`}>
          {error}
        </div>
      )}
    </div>
  );
}
