type StoredMessage = {
  type: string;
  from: string;
  payload: string;
};

export class MessageStore {
  private messages: StoredMessage[] = [];

  addMessage(message: StoredMessage) {
    this.messages.push(message);
  }

  getMessages(): StoredMessage[] {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}
