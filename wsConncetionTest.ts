

const id = crypto.randomUUID() || "anon"
const ws = new WebSocket(
  `ws://localhost:3030/chat?peerId=${encodeURIComponent(id)}`
);

ws.onopen = () => {
  console.log("connected to server");
};

ws.onmessage = (event) => {
  console.log("received: ", event.data)
  
  const msg = JSON.parse(event.data.toString())
  console.log(msg)
}

process.stdin.on("data", (data) => {
  ws.send(JSON.stringify({
    type: "chat",
    from: id,
    payload: data.toString().trim()
  }));
});

ws.onclose = () => {
  console.log("connection closed")
}

ws.onerror = (err) => {
  console.log("ws error:", err)
}
