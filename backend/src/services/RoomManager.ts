interface Room {
  id: string;
  createdAt: number;
  peers: Set<string>;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(): string {
    const roomId = crypto.randomUUID();
    this.rooms.set(roomId, {
      id: roomId,
      createdAt: Date.now(),
      peers: new Set(),
    });
    return roomId;
  }

  joinRoom(roomId: string, peerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.peers.add(peerId);
    return true;
  }

  leaveRoom(roomId: string, peerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.peers.delete(peerId);
    if (room.peers.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoomPeers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.peers) : [];
  }

  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }
}
