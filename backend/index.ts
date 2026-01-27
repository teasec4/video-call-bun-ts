import type { ServerWebSocket } from "bun";

type WSData = {
  id: string;
}

type Message = {
  type: "offer" | "answer" | "ice";
  to: string;
  payload: any;
}

const port = 3030

const clients = new Map<string, ServerWebSocket<WSData>>();

Bun.serve<WSData>({
  port: port,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      if (server.upgrade(req, { data: {} as WSData })) {
        return;
      }
      return new Response("Upgrade failed", { status: 400 });
    }
    return new Response("Hello World");
  },
  websocket: {
    open(ws: ServerWebSocket<WSData>) {
      const id = crypto.randomUUID();

      ws.data = { id };
      clients.set(id, ws);

      ws.send(JSON.stringify({ type: "id", payload: id }));
    },

    message(ws: ServerWebSocket<WSData>, msg: string | Buffer) {
      const data: Message = JSON.parse(msg.toString());
      console.log("Message from", ws.data.id, data)
      // broadcast
      for (const [, client] of clients) {
        client.send(
          JSON.stringify({
            from: ws.data.id,
            ...data,
          })
        )
      }
    },

    close(ws: ServerWebSocket<WSData>) {
      clients.delete(ws.data.id);
    },
  },
  
  
});
console.log(`Serving on port: ${port}`)
