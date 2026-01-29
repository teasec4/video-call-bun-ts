import type { ServerWebSocket } from "bun";
import type { WSData, Client } from "../types/ws";
import { ClientManager } from "../services/ClientManager";

export function createWSHandlers(clientManager: ClientManager) {
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
      
      // broadcast
      const message = JSON.stringify({
        from: ws.data.id,
        ...data,
      });
      clientManager.broadcastMessage(message);
    },

    close(ws: ServerWebSocket<WSData>) {
      clientManager.removeClient(ws.data.id);
    },
  };
}
