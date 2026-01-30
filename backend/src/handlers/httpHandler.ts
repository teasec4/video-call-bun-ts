import type { MessageStore } from "../services/MessageStore";

export function createHttpHandler(messageStore: MessageStore) {
  return (req: Request, url: URL): Response | null => {
    // GET /api/messages - возвращаем всю историю
    if (url.pathname === "/api/messages" && req.method === "GET") {
      const messages = messageStore.getMessages();
      return new Response(JSON.stringify(messages), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return null; // Не наш эндпоинт
  };
}
