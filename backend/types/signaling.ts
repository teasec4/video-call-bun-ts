export type SignalingMessage = 
  | { type: "offer"; payload: RTCSessionDescription }
  | { type: "answer"; payload: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; payload: RTCIceCandidateInit }
  | { type: "ping" };
