import { useState } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";
import { API_URL } from "../config/api";

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

  const btnPrimaryStyle: React.CSSProperties = {
    backgroundColor: 'var(--btn-primary)',
    color: 'var(--txt-primary)',
  };

  const btnPrimaryHoverStyle: React.CSSProperties = {
    ...btnPrimaryStyle,
  };

  const btnSecondaryStyle: React.CSSProperties = {
    backgroundColor: 'var(--btn-secondary)',
    color: 'var(--txt-secondary)',
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bd-primary)' }} className="w-full max-w-md mx-auto p-6 rounded-lg border">
      <h2 style={{ color: 'var(--txt-primary)' }} className="text-xl font-bold mb-6">Video Room</h2>

      {roomId ? (
        <div className="space-y-4">
          <div style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bd-secondary)' }} className="p-4 rounded border">
            <p style={{ color: 'var(--txt-muted)' }} className="text-sm mb-2">Room ID:</p>
            <p style={{ color: 'var(--txt-primary)' }} className="font-mono break-all">{roomId}</p>
          </div>

          <button
            onClick={copyRoomLink}
            style={btnPrimaryStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-primary)')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition"
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

          <p style={{ color: 'var(--txt-muted)' }} className="text-sm text-center">
            Share the link to invite others to join
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label style={{ color: 'var(--txt-muted)' }} className="block text-sm mb-2">
              Room ID (to join)
            </label>
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="Paste room ID here"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--txt-primary)',
                borderColor: 'var(--bd-primary)',
              }}
              className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={loading}
            style={btnSecondaryStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-secondary)')}
            className="w-full py-3 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div style={{ borderColor: 'var(--bd-primary)' }} className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--txt-muted)' }} className="px-2">or</span>
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            style={btnPrimaryStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-primary)')}
            className="w-full py-3 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'var(--st-error)', color: 'var(--txt-primary)' }} className="mt-4 p-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
