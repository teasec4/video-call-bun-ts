import type { Client } from "../types";

export class ClientManager {
  private clients = new Map<string, Client>();
  private roomClients = new Map<string, Set<string>>(); // roomId -> Set<peerId>

  addClient(client: Client) {
    this.clients.set(client.id, client);
    
    // Добавляем клиента в комнату
    if (!this.roomClients.has(client.roomId)) {
      this.roomClients.set(client.roomId, new Set());
    }
    this.roomClients.get(client.roomId)!.add(client.id);
  }

  removeClient(id: string) {
    const client = this.clients.get(id);
    if (client) {
      const roomSet = this.roomClients.get(client.roomId);
      if (roomSet) {
        roomSet.delete(id);
        if (roomSet.size === 0) {
          this.roomClients.delete(client.roomId);
        }
      }
    }
    this.clients.delete(id);
  }

  getClient(id: string): Client | undefined {
    return this.clients.get(id);
  }

  getAllClients(): Map<string, Client> {
    return this.clients;
  }

  broadcastMessage(message: string) {
    for (const [, client] of this.clients) {
      try {
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          client.ws.send(message);
        }
      } catch (err) {
        console.error(`❌ Failed to send message to client ${client.id}:`, err);
      }
    }
  }

  // Отправить сообщение только в конкретной комнате
  broadcastToRoom(roomId: string, message: string) {
    const roomSet = this.roomClients.get(roomId);
    if (!roomSet) return;
    
    for (const clientId of roomSet) {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          if (client.ws.readyState === 1) { // WebSocket.OPEN
            client.ws.send(message);
          }
        } catch (err) {
          console.error(`❌ Failed to send message to client ${clientId}:`, err);
        }
      }
    }
  }

  getClientsByRoom(roomId: string): Client[] {
    const roomSet = this.roomClients.get(roomId);
    if (!roomSet) return [];
    
    return Array.from(roomSet)
      .map(clientId => this.clients.get(clientId))
      .filter((client): client is Client => client !== undefined);
  }
}
