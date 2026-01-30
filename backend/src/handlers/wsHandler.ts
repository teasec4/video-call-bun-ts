import type { ServerWebSocket } from "bun";
import type { WSData, Client } from "../types/ws";
import { ClientManager } from "../services/ClientManager";
import type { MessageStore } from "../services/MessageStore";

export function createWSHandlers(clientManager: ClientManager, messageStore: MessageStore) {
  return {
    open(ws: ServerWebSocket<WSData>) {
      const id = ws.data.id;

      const client: Client = {
        id: id,
        ws: ws,
      };
      clientManager.addClient(client);

      ws.send(JSON.stringify({ type: "id", payload: id }));
    },

    message(ws: ServerWebSocket<WSData>, msg: string) {
      const data = JSON.parse(msg.toString());
      console.log("Message from", data.from, data);

      const message = {
        from: ws.data.id,
        ...data,
      };

      // Сохраняем в MessageStore
      messageStore.addMessage(message);

      // Broadcast всем
      const broadcastMsg = JSON.stringify(message);
      clientManager.broadcastMessage(broadcastMsg);
    },

    close(ws: ServerWebSocket<WSData>) {
      clientManager.removeClient(ws.data.id);
    },
  };
}
