import { useNavigate } from "react-router-dom";
import { RoomControl } from "../components/roomControl";

export function HomePage() {
  const navigate = useNavigate();

  const handleRoomCreated = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
      <RoomControl
        roomId={null}
        onRoomCreated={handleRoomCreated}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}
