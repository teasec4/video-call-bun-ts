export class SignalingService{
  private rooms = new Map<string, Set<string>>();
  
  broadcastToRoom(fromId: string, roomId: string, message: any) {
    // broadcast to room logic
  }
}