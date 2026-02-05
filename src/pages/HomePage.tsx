import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { RoomControl } from "../components/roomControl";
import { colorStyles } from "../config/styles";

export function HomePage() {
  const navigate = useNavigate();

  const handleRoomCreated = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={colorStyles.bgPrimary} className="w-screen h-screen flex items-center justify-center">
      <RoomControl
        roomId={null}
        onRoomCreated={handleRoomCreated}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}
