type Message = {
  type: "offer" | "answer" | "ice";
  to: string;
  payload: any;
}

export class SignalingService {
  private ws: WebSocket
  
  constructor(url: string) {
    this.ws = new WebSocket(url)
  }
  
  send(msg: Message) {
    this.ws.send(JSON.stringify(msg))
  }
  
  onMessage(cb: (msg: Message) => void) {
    this.ws.onmessage = (event) => {
      cb(JSON.parse(event.data))
    }
  }
}