import type { WSData } from "./types/ws";
import { PORT } from "./config/constants";
import { ClientManager } from "./services/ClientManager";
import { createWSHandlers } from "./handlers/wsHandler";

const clientManager = new ClientManager();
const wsHandlers = createWSHandlers(clientManager);

Bun.serve<WSData>({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/chat") {
      const peerId = url.searchParams.get("peerId");
      if (!peerId) {
        return new Response("Missing peer id", { status: 400 });
      }

      if (
        server.upgrade(req, {
          data: { id: peerId },
        })
      ) {
        return;
      }
      return new Response("Upgrade failed", { status: 400 });
    }
    return new Response("Hello World");
  },
  websocket: wsHandlers,
});

console.log(`Serving on port: ${PORT}`);
