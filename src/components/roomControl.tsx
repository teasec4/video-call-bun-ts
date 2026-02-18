import { useState } from "react";
import clsx from "clsx";
import { useHttp } from "@/hooks/useHttpConnectRoom";

const API_URL = 'http://localhost:3030';

interface RoomControlProps {
  onRoomCreated: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
}

export function RoomControl({ onRoomCreated, onJoinRoom}:RoomControlProps) {
  const [inputRoomId, setInputRoomId] = useState("");
  
  const { createRoom, joinRoom, loading, error } = useHttp({
    onCreateRoom: (id) => console.log("Created:", id),
  });
  
  const [clientId] = useState(() => crypto.randomUUID());
  
  
  const handleCreateRoom = async () => {
    const newRoomId = await createRoom(clientId);
    onRoomCreated(newRoomId);
  };
  
  const handleJoinRoom = async () => {
    await joinRoom(inputRoomId, clientId);
    onJoinRoom(inputRoomId);
  };

  const btnPrimaryStyle: React.CSSProperties = {
    backgroundColor: 'var(--btn-primary)',
    color: 'var(--txt-primary)',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    backgroundColor: 'var(--btn-secondary)',
    color: 'var(--txt-secondary)',
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bd-primary)' }} className="w-full max-w-md mx-auto p-6 rounded-lg border">
      <h2 style={{ color: 'var(--txt-primary)' }} className="text-xl font-bold mb-6">Video Room</h2>


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
      

      {error && (
        <div style={{ backgroundColor: 'var(--st-error)', color: 'var(--txt-primary)' }} className="mt-4 p-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
