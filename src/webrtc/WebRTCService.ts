export class WebRTCService{
  private pc: RTCPeerConnection | null = null
  
  async initPeerConnection(
    onLocalDescription: (desc: RTCSessionDescriptionInit) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ) {
    this.pc = new RTCPeerConnection({
      iceServers:[{urls: "stun:stun.l.google.com:19302"}]
    })
    
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE generated")
        onIceCandidate(event.candidate)
      }
    }
    
    this.pc.ontrack = (event) => {
      console.log("Remote track received");
        const remoteVideo = document.getElementById(
          "remoteVideo"
        ) as HTMLVideoElement;
  
        remoteVideo.srcObject = event.streams[0];
    }
    console.log("PeerConnection created");
  }
  
  addStream(stream: MediaStream) {
      if (!this.pc) return;
      stream.getTracks().forEach((track) => {
        this.pc!.addTrack(track, stream);
      });
  }
  
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error("PC not initialized");

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }
  
  async setRemoteDescription(desc: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(desc);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    await this.pc.addIceCandidate(candidate);
  }
  
}