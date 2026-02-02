import { useNavigate } from "react-router-dom";
import { RoomControl } from "../components/roomControl";
import { COLORS } from "../config/colors";

export function HomePage() {
  const navigate = useNavigate();

  const handleRoomCreated = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className={`w-screen h-screen ${COLORS.bg.primary} flex items-center justify-center`}>
      <RoomControl
        roomId={null}
        onRoomCreated={handleRoomCreated}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}
