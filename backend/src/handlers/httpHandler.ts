import type { MessageStore } from "../services/MessageStore";
import type { RoomManager } from "../services/RoomManager";

// Валидация UUID формата
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export function createHttpHandler(messageStore: MessageStore, roomManager: RoomManager) {
  return async (req: Request, url: URL): Promise<Response | null> => {
    // Health check endpoint
    if (url.pathname === "/health" && req.method === "GET") {
      return new Response(JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString() 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/messages/:roomId - возвращаем историю комнаты
    const messagesMatch = url.pathname.match(/^\/api\/messages\/([a-f0-9-]+)$/);
    if (messagesMatch && messagesMatch[1] && req.method === "GET") {
      const roomId = messagesMatch[1];
      if (!isValidUUID(roomId)) {
        return new Response(JSON.stringify({ error: "Invalid room ID format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const messages = messageStore.getMessagesByRoom(roomId);
      return new Response(JSON.stringify(messages), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/messages - все сообщения (deprecated, оставляю для совместимости)
    if (url.pathname === "/api/messages" && req.method === "GET") {
      const messages = messageStore.getMessages();
      return new Response(JSON.stringify(messages), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/room - создать новую комнату
    if (url.pathname === "/api/room" && req.method === "POST") {
      const roomId = roomManager.createRoom();
      return new Response(JSON.stringify({ roomId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/room/:roomId - проверить существование комнаты и получить пиров
    const singleRoomMatch = url.pathname.match(/^\/api\/room\/([a-f0-9-]+)$/);
    if (singleRoomMatch && singleRoomMatch[1] && req.method === "GET") {
      const roomId = singleRoomMatch[1];
      if (!isValidUUID(roomId)) {
        return new Response(JSON.stringify({ error: "Invalid room ID format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const exists = roomManager.roomExists(roomId);
      if (!exists) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      const peers = roomManager.getRoomPeers(roomId);
      return new Response(JSON.stringify({ roomId, peers }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/room/join - присоединиться к комнате (deprecated)
    if (url.pathname === "/api/room/join" && req.method === "POST") {
      let body: { roomId: string; peerId: string } | null = null;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!body || !body.roomId || !body.peerId) {
        return new Response(
          JSON.stringify({ error: "Missing roomId or peerId" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!isValidUUID(body.roomId)) {
        return new Response(JSON.stringify({ error: "Invalid room ID format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const joined = roomManager.joinRoom(body.roomId, body.peerId);
      if (!joined) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const peers = roomManager.getRoomPeers(body.roomId);
      return new Response(JSON.stringify({ success: true, peers }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return null;
  };
}

