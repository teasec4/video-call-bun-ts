export type StoredMessage = {
  type: string;
  from: string;
  payload: any;
  roomId: string;
};

export class MessageStore {
  private messages: StoredMessage[] = [];
  private readonly maxMessagesPerRoom = 100; // Лимит сообщений на комнату

  addMessage(message: StoredMessage) {
    this.messages.push(message);
    
    // Ограничиваем количество сообщений в комнате
    const roomMessages = this.messages.filter(msg => msg.roomId === message.roomId);
    if (roomMessages.length > this.maxMessagesPerRoom) {
      // Удаляем самые старые сообщения
      const toRemove = roomMessages.length - this.maxMessagesPerRoom;
      const roomMessageIds = new Set(roomMessages.slice(0, toRemove).map((_, idx) => {
        const firstIndex = this.messages.findIndex(m => m.roomId === message.roomId);
        return firstIndex + idx;
      }));
      this.messages = this.messages.filter((_, idx) => !roomMessageIds.has(idx));
    }
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
