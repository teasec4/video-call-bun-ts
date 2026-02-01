// WebRTC и WebSocket типы

export type SignalingMessageType = 
  | "offer" 
  | "answer" 
  | "ice-candidate" 
  | "hang-up"
  | "peer-connected"
  | "peer-id"
  | "message-history"
  | "room-closed"
  | "chat";

export interface SignalingMessage {
  type: SignalingMessageType;
  from?: string;
  to?: string;
  payload?: any;
  peerId?: string;
  messages?: any[];
  reason?: string;
}

export interface WebRTCState {
  isCalling: boolean;
  callActive: boolean;
  connectionState: RTCPeerConnectionState | null;
  iceConnectionState: RTCIceConnectionState | null;
  signalingState: RTCSignalingState | null;
}

export interface MediaState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  cameras: MediaDeviceInfo[];
  selectedCameraId: string;
}

