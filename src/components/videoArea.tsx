import { PhoneOff, MessageSquare, Info, Video, VideoOff, Mic, MicOff, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { COLORS } from "../config/colors";

interface VideoAreaProps {
  onToggleChat: () => void;
  onToggleInfo: () => void;
  onLeaveRoom: () => void;
  chatOpen: boolean;
  infoOpen: boolean;
  roomId: string;
  peerId: string;
  remotePeerId: string | null;
  webrtc: ReturnType<typeof import("../hooks/useWebRTC").useWebRTC>;
}

export function VideoArea({ 
  onToggleChat,
  onToggleInfo,
  onLeaveRoom,
  chatOpen,
  infoOpen,
  roomId, 
  peerId, 
  remotePeerId, 
  webrtc 
}: VideoAreaProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [showCameraPanel, setShowCameraPanel] = useState(false);
  const [showLocalVideo, setShowLocalVideo] = useState(true);

  // Инициализация локального потока при монтировании
  useEffect(() => {
    // Only initialize once
    let isInitialized = false;

    const initialize = async () => {
      if (isInitialized) return;
      isInitialized = true;

      if (!webrtc.mediaState.localStream) {
        try {
          await webrtc.initializeLocalStream(webrtc.mediaState.selectedCameraId);
        } catch (err) {
          console.error("Failed to initialize local stream:", err);
          alert("Allow camera and microphone access");
        }
      }

      if (webrtc.mediaState.cameras.length === 0) {
        webrtc.getCameras();
      }
    };

    initialize();
  }, [webrtc]);

  // Обновление локального видео элемента
  useEffect(() => {
    if (localVideoRef.current && webrtc.mediaState.localStream && showLocalVideo) {
      localVideoRef.current.srcObject = webrtc.mediaState.localStream;
    }
  }, [webrtc.mediaState.localStream, showLocalVideo]);

  // Обновление удаленного видео элемента
  useEffect(() => {
    if (remoteVideoRef.current && webrtc.mediaState.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.mediaState.remoteStream;
    }
  }, [webrtc.mediaState.remoteStream]);

  // Убрали автоматический звонок отсюда - он обрабатывается в RoomPage через handlePeerConnected

  return (
    <div className={`w-full h-full relative ${COLORS.bg.primary} overflow-hidden`}>
      <div className={`absolute inset-0 ${COLORS.bg.overlay}`}>
        {webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-contain"
            onLoadedMetadata={() => console.log("✅ Remote video metadata loaded")}
            onPlay={() => console.log("✅ Remote video playing")}
            onCanPlay={() => console.log("✅ Remote video can play")}
            onError={(e) => console.error("❌ Remote video error:", e)}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${COLORS.text.muted}`}>
            <p>Waiting for peer connection...</p>
          </div>
        )}
        
        {showLocalVideo && webrtc.mediaState.localStream && (
          <div className={`absolute bottom-6 right-6 w-48 h-36 ${COLORS.bg.secondary} rounded-lg shadow-lg border-2 ${COLORS.border.primary} overflow-hidden`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${COLORS.bg.overlay}`}
            />
            <button
              onClick={() => setShowLocalVideo(false)}
              className={`absolute top-2 right-2 ${COLORS.bg.primary}/80 hover:${COLORS.bg.primary} w-6 h-6 rounded flex items-center justify-center text-xs ${COLORS.text.secondary}`}
              title="Minimize"
            >
              −
            </button>
          </div>
        )}

        {!showLocalVideo && (
          <button
            onClick={() => setShowLocalVideo(true)}
            className={`absolute bottom-6 right-6 ${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary} px-3 py-2 rounded text-xs`}
          >
            Show Local Video
          </button>
        )}

        <button
          onClick={onToggleInfo}
          className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-10 ${
            infoOpen
              ? `${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary}`
              : `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`
          }`}
          title={infoOpen ? "Close info" : "Open info"}
        >
          <Info size={24} />
        </button>

        <button
          onClick={onToggleChat}
          className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-10 ${
            chatOpen
              ? `${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary}`
              : `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`
          }`}
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={24} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-4">
          {!remotePeerId ? (
            <div className={`flex items-center gap-3 px-4 py-3 ${COLORS.bg.primary}/80 backdrop-blur rounded-lg border ${COLORS.border.primary}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Waiting for peer...</span>
              </div>
              <button
                onClick={onLeaveRoom}
                className={`${COLORS.status.error} hover:opacity-80 ${COLORS.text.primary} px-3 py-1 rounded text-sm transition`}
                title="Leave room"
              >
                Leave
              </button>
            </div>
          ) : webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
            <div className={`flex items-center gap-3 px-4 py-3 ${COLORS.bg.primary}/80 backdrop-blur rounded-lg border ${COLORS.border.primary}`}>
              <button
                onClick={webrtc.toggleVideo}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  webrtc.mediaState.videoEnabled
                    ? `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`
                    : `${COLORS.status.error} hover:opacity-80 ${COLORS.text.primary}`
                }`}
                title={webrtc.mediaState.videoEnabled ? "Turn off video" : "Turn on video"}
              >
                {webrtc.mediaState.videoEnabled ? (
                  <Video size={20} />
                ) : (
                  <VideoOff size={20} />
                )}
              </button>

              <button
                onClick={webrtc.toggleAudio}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  webrtc.mediaState.audioEnabled
                    ? `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`
                    : `${COLORS.status.error} hover:opacity-80 ${COLORS.text.primary}`
                }`}
                title={webrtc.mediaState.audioEnabled ? "Mute" : "Unmute"}
              >
                {webrtc.mediaState.audioEnabled ? (
                  <Mic size={20} />
                ) : (
                  <MicOff size={20} />
                )}
              </button>

              {webrtc.mediaState.cameras.length > 1 && (
                <button
                  onClick={() => setShowCameraPanel(true)}
                  className={`${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary} p-2 rounded-lg transition flex items-center justify-center gap-1.5`}
                  title="Switch camera"
                >
                  <Camera size={18} />
                  <span className="text-xs font-medium">Switch</span>
                </button>
              )}

              <button
                onClick={webrtc.hangup}
                className={`${COLORS.status.error} hover:opacity-80 ${COLORS.text.primary} w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg`}
                title="End call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 ${COLORS.bg.secondary}/80 backdrop-blur rounded ${COLORS.text.secondary}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Initializing call...</span>
            </div>
          )}
        </div>
      </div>

      {showCameraPanel && (webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive) && webrtc.mediaState.cameras.length > 1 && (
        <div className={`fixed inset-0 ${COLORS.bg.overlay}/50 flex items-center justify-center z-50`}>
          <div className={`${COLORS.bg.secondary} p-6 rounded-lg shadow-lg max-w-sm w-full mx-4`}>
            <h2 className={`text-xl font-semibold ${COLORS.text.primary} mb-4`}>Switch Camera</h2>
            <div className="space-y-2 mb-4">
              {webrtc.mediaState.cameras.map((camera) => (
                <button
                  key={camera.deviceId}
                  onClick={() => {
                    webrtc.switchCamera(camera.deviceId);
                    setShowCameraPanel(false);
                  }}
                  className={`w-full p-3 rounded text-left transition ${
                    webrtc.mediaState.selectedCameraId === camera.deviceId
                      ? `${COLORS.button.primary} ${COLORS.text.primary}`
                      : `${COLORS.button.secondary} ${COLORS.text.secondary} ${COLORS.button.secondaryHover}`
                  }`}
                >
                  {camera.label || `Camera ${webrtc.mediaState.cameras.indexOf(camera) + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCameraPanel(false)}
              className={`w-full ${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary} py-2 rounded transition`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
