import { PhoneOff, MessageSquare, Info, Video, VideoOff, Mic, MicOff, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { colorStyles, createButtonHoverHandler } from "../config/styles";

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

  useEffect(() => {
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

  useEffect(() => {
    if (localVideoRef.current && webrtc.mediaState.localStream && showLocalVideo) {
      localVideoRef.current.srcObject = webrtc.mediaState.localStream;
    }
  }, [webrtc.mediaState.localStream, showLocalVideo]);

  useEffect(() => {
    if (remoteVideoRef.current && webrtc.mediaState.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.mediaState.remoteStream;
    }
  }, [webrtc.mediaState.remoteStream]);

  return (
    <div style={colorStyles.bgPrimary} className="w-full h-full relative overflow-hidden">
      <div style={colorStyles.bgOverlay} className="absolute inset-0">
        {webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-contain"
          />
        ) : (
          <div style={colorStyles.textMuted} className="w-full h-full flex items-center justify-center">
            <p>Waiting for peer connection...</p>
          </div>
        )}
        
        {showLocalVideo && webrtc.mediaState.localStream && (
          <div style={colorStyles.bgSecondary} className="absolute bottom-6 right-6 w-48 h-36 rounded-lg shadow-lg border-2" style={{ ...colorStyles.bgSecondary, borderColor: 'var(--bd-primary)' }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setShowLocalVideo(false)}
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-xs transition hover:opacity-80"
              title="Minimize"
            >
              −
            </button>
          </div>
        )}

        {!showLocalVideo && (
          <button
            onClick={() => setShowLocalVideo(true)}
            style={colorStyles.buttonSecondary}
            {...createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)')}
            className="absolute bottom-6 right-6 px-3 py-2 rounded text-xs transition"
          >
            Show Local Video
          </button>
        )}

        <button
          onClick={onToggleInfo}
          style={infoOpen ? colorStyles.buttonSecondary : colorStyles.buttonPrimary}
          {...(infoOpen ? createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)') : createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)'))}
          className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10 transition"
          title={infoOpen ? "Close info" : "Open info"}
        >
          <Info size={24} />
        </button>

        <button
          onClick={onToggleChat}
          style={chatOpen ? colorStyles.buttonSecondary : colorStyles.buttonPrimary}
          {...(chatOpen ? createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)') : createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)'))}
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10 transition"
          title={chatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={24} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-4">
          {!remotePeerId ? (
            <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--txt-primary)', borderColor: 'var(--bd-primary)' }} className="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Waiting for peer...</span>
              </div>
              <button
                onClick={onLeaveRoom}
                style={colorStyles.statusError}
                className="px-3 py-1 rounded text-sm transition hover:opacity-80"
                title="Leave room"
              >
                Leave
              </button>
            </div>
          ) : webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive ? (
            <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--txt-primary)', borderColor: 'var(--bd-primary)' }} className="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur">
              <button
                onClick={webrtc.toggleVideo}
                style={webrtc.mediaState.videoEnabled ? colorStyles.buttonPrimary : colorStyles.statusError}
                {...(webrtc.mediaState.videoEnabled ? createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)') : {})}
                className="w-10 h-10 rounded-full flex items-center justify-center transition"
                title={webrtc.mediaState.videoEnabled ? "Turn off video" : "Turn on video"}
              >
                {webrtc.mediaState.videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                onClick={webrtc.toggleAudio}
                style={webrtc.mediaState.audioEnabled ? colorStyles.buttonPrimary : colorStyles.statusError}
                {...(webrtc.mediaState.audioEnabled ? createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)') : {})}
                className="w-10 h-10 rounded-full flex items-center justify-center transition"
                title={webrtc.mediaState.audioEnabled ? "Mute" : "Unmute"}
              >
                {webrtc.mediaState.audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              {webrtc.mediaState.cameras.length > 1 && (
                <button
                  onClick={() => setShowCameraPanel(true)}
                  style={colorStyles.buttonSecondary}
                  {...createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)')}
                  className="p-2 rounded-lg transition flex items-center justify-center gap-1.5"
                  title="Switch camera"
                >
                  <Camera size={18} />
                  <span className="text-xs font-medium">Switch</span>
                </button>
              )}

              <button
                onClick={webrtc.hangup}
                style={colorStyles.statusError}
                className="w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg hover:opacity-80"
                title="End call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--txt-primary)' }} className="flex items-center gap-2 px-4 py-2 rounded backdrop-blur">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Initializing call...</span>
            </div>
          )}
        </div>
      </div>

      {showCameraPanel && (webrtc.webrtcState.isCalling || webrtc.webrtcState.callActive) && webrtc.mediaState.cameras.length > 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div style={colorStyles.bgSecondary} className="p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 style={colorStyles.textPrimary} className="text-xl font-semibold mb-4">Switch Camera</h2>
            <div className="space-y-2 mb-4">
              {webrtc.mediaState.cameras.map((camera) => (
                <button
                  key={camera.deviceId}
                  onClick={() => {
                    webrtc.switchCamera(camera.deviceId);
                    setShowCameraPanel(false);
                  }}
                  style={webrtc.mediaState.selectedCameraId === camera.deviceId ? colorStyles.buttonPrimary : colorStyles.buttonSecondary}
                  className="w-full p-3 rounded text-left transition"
                >
                  {camera.label || `Camera ${webrtc.mediaState.cameras.indexOf(camera) + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCameraPanel(false)}
              style={colorStyles.buttonSecondary}
              {...createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)')}
              className="w-full py-2 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
