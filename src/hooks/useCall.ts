import { SignalingService } from "@/signaling/SignalingService";
import { WebRTCService } from "@/webrtc/WebRTCService";

export function useCall(peerId: string) {
  const webrtc = new WebRTCService()
  const signaling = new SignalingService("ws://localhost:8081")
  
  async function startCall(localStream: MediaStream) {
    await webrtc.initPeerConnection(
      (desc) => {
        signaling.send({
          type: desc.type === "offer" ? "offer" : "answer",
          to: peerId,
          payload: desc,
        })
      },
      (candidate) => {
        signaling.send({
          type: "ice",
          to: peerId,
          payload: candidate,
        });
      }
    )
    
    webrtc.addStream(localStream)
    
    const offer = await webrtc.createOffer()
    
    signaling.send({
      type: "offer",
      to: peerId,
      payload: offer,
    })
  }
  
  signaling.onMessage(async (msg) => {
    if (msg.type === "answer") {
      await webrtc.setRemoteDescription(msg.payload);
    }

    if (msg.type === "ice") {
      await webrtc.addIceCandidate(msg.payload);
    }
  })
  
  return {startCall}
}