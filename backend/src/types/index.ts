import type { ServerWebSocket } from "bun";

// WebSocket data and client types
export type WSData = {
  id: string;
  roomId: string;
};

export type Client = {
  id: string;
  roomId: string;
  ws: ServerWebSocket<WSData>;
};

// Signaling message types
export type SignalingMessage = 
  | { type: "offer"; payload: RTCSessionDescription; to?: string }
  | { type: "answer"; payload: RTCSessionDescriptionInit; to?: string }
  | { type: "ice-candidate"; payload: RTCIceCandidateInit; to: string }
  | { type: "ping" };
