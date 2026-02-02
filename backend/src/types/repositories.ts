// Интерфейсы для будущей интеграции с БД

export interface IRoomRepository {
  createRoom(): Promise<string>;
  getRoom(roomId: string): Promise<Room | null>;
  deleteRoom(roomId: string): Promise<void>;
  addPeerToRoom(roomId: string, peerId: string): Promise<void>;
  removePeerFromRoom(roomId: string, peerId: string): Promise<void>;
  getRoomPeers(roomId: string): Promise<string[]>;
  roomExists(roomId: string): Promise<boolean>;
}

export interface IMessageRepository {
  addMessage(message: StoredMessage): Promise<void>;
  getMessagesByRoom(roomId: string, limit?: number): Promise<StoredMessage[]>;
  clearMessagesByRoom(roomId: string): Promise<void>;
}

export interface Room {
  id: string;
  createdAt: number;
  peers: string[];
}

export interface StoredMessage {
  type: string;
  from: string;
  payload: any;
  roomId: string;
  timestamp?: number;
}
