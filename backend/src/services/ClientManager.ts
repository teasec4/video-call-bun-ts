import type { Client } from "../types/ws";

export class ClientManager {
  private clients = new Map<string, Client>();

  addClient(client: Client) {
    this.clients.set(client.id, client);
  }

  removeClient(id: string) {
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
      client.ws.send(message);
    }
  }
}
