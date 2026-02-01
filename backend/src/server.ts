import type { WSData } from "./types";
import { PORT, CORS_ORIGIN } from "./config/constants";
import { ClientManager } from "./services/ClientManager";
import { createWSHandlers } from "./handlers/wsHandler";
import { createHttpHandler } from "./handlers/httpHandler";
import { MessageStore } from "./services/MessageStore";
import { RoomManager } from "./services/RoomManager";

const clientManager = new ClientManager();
const messageStore = new MessageStore()
const roomManager = new RoomManager();
const wsHandlers = createWSHandlers(clientManager, messageStore);
const httpHandler = createHttpHandler(messageStore, roomManager)

Bun.serve<WSData>({
  port: PORT,
  hostname: "0.0.0.0", // Слушаем на всех интерфейсах, не только localhost
  async fetch(req, server) {
    const url = new URL(req.url);

    // CORS headers для всех ответов
    const corsHeaders = {
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Для preflight запроса
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const httpResponse = await httpHandler(req, url);
    if (httpResponse) {
      const responseHeaders = new Headers(httpResponse.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
      return new Response(httpResponse.body, {
        status: httpResponse.status,
        headers: responseHeaders,
      });
    }

    if (url.pathname === "/chat") {
      const peerId = url.searchParams.get("peerId");
      const roomId = url.searchParams.get("roomId");
      
      if (!peerId || !roomId) {
        return new Response("Missing peer id or room id", { status: 400 });
      }

      if (
        server.upgrade(req, {
          data: { id: peerId, roomId: roomId },
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
