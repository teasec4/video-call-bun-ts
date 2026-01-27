import type { ServerWebSocket } from "bun";


const port = 3030

const clients = new Map<string, Client>();

type Client = {
  id: string;
  ws: ServerWebSocket<WSData>;
}

type WSData = {
  id: string;
};

Bun.serve<WSData>({
  port: port,
  fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === "/chat") {
      const peerId = url.searchParams.get("peerId");
      if (!peerId) {
        return new Response("Missing peer id", { status: 400 });
      }
      
      if (server.upgrade(req, {
        data: { id: peerId }
      })) {
        return;
      }
      return new Response("Upgrade failed", { status: 400 });
    }
    return new Response("Hello World");
  },
  websocket: {
    open(ws) {
      const id = ws.data.id;
      
      const client : Client = {
        id: id,
        ws: ws
      }
      clients.set(id, client);

      ws.send(JSON.stringify({ type: "id", payload: id }));
    },

    message(ws: ServerWebSocket<WSData>, msg: string) {
      const data = JSON.parse(msg.toString());
      console.log("Message from", data.from, data)
      // broadcast
      for (const [, client] of clients) {
        client.ws.send(
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
