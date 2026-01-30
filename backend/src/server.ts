import type { WSData } from "./types/ws";
import { PORT } from "./config/constants";
import { ClientManager } from "./services/ClientManager";
import { createWSHandlers } from "./handlers/wsHandler";
import { createHttpHandler } from "./handlers/httpHandler";
import { MessageStore } from "./services/MessageStore";

const clientManager = new ClientManager();
const messageStore = new MessageStore()
const wsHandlers = createWSHandlers(clientManager, messageStore);
const httpHandler = createHttpHandler(messageStore)

Bun.serve<WSData>({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    // CORS headers для всех ответов
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Для preflight запроса
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const httpResponse = httpHandler(req, url);
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
