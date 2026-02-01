export type StoredMessage = {
  type: string;
  from: string;
  payload: any;
  roomId: string;
};

export class MessageStore {
  private messages: StoredMessage[] = [];

  addMessage(message: StoredMessage) {
    this.messages.push(message);
  }

  getMessages(): StoredMessage[] {
    return this.messages;
  }

  getMessagesByRoom(roomId: string): StoredMessage[] {
    return this.messages.filter(msg => msg.roomId === roomId);
  }

  clearMessages() {
    this.messages = [];
  }

  clearMessagesByRoom(roomId: string) {
    this.messages = this.messages.filter(msg => msg.roomId !== roomId);
  }
}
