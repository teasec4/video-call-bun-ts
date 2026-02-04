import { useRef, useReducer, useCallback, useEffect } from "react";
import type { WebRTCState, MediaState } from "../types/webrtc";
import { WEBRTC_CONFIG } from "../config/constants";

interface UseWebRTCOptions {
  remotePeerId: string | null;
  onSendSignaling?: (message: { type: string; to?: string; payload?: any }) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

interface WebRTCAction {
  type: string;
  payload?: any;
}

interface WebRTCFullState {
  webrtcState: WebRTCState;
  mediaState: MediaState;
}

const initialState: WebRTCFullState = {
  webrtcState: {
    isCalling: false,
    callActive: false,
    connectionState: null,
    iceConnectionState: null,
    signalingState: null,
  },
  mediaState: {
    localStream: null,
    remoteStream: null,
    videoEnabled: true,
    audioEnabled: true,
    cameras: [],
    selectedCameraId: "",
  },
};

function webrtcReducer(state: WebRTCFullState, action: WebRTCAction): WebRTCFullState {
  switch (action.type) {
    // Media actions
    case 'SET_CAMERAS':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          cameras: action.payload.cameras,
          selectedCameraId: action.payload.selectedCameraId || state.mediaState.selectedCameraId,
        },
      };

    case 'SET_LOCAL_STREAM':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          localStream: action.payload.stream,
          videoEnabled: action.payload.videoEnabled,
          audioEnabled: action.payload.audioEnabled,
        },
      };

    case 'SET_REMOTE_STREAM':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          remoteStream: action.payload,
        },
      };

    case 'TOGGLE_VIDEO':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          videoEnabled: !state.mediaState.videoEnabled,
        },
      };

    case 'TOGGLE_AUDIO':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          audioEnabled: !state.mediaState.audioEnabled,
        },
      };

    case 'SELECT_CAMERA':
      return {
        ...state,
        mediaState: {
          ...state.mediaState,
          selectedCameraId: action.payload,
        },
      };

    // WebRTC connection actions
    case 'START_CALL':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          isCalling: true,
        },
      };

    case 'CALL_ACTIVE':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          isCalling: false,
          callActive: true,
        },
      };

    case 'END_CALL':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          isCalling: false,
          callActive: false,
          connectionState: null,
          iceConnectionState: null,
        },
        mediaState: {
          ...state.mediaState,
          remoteStream: null,
        },
      };

    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          connectionState: action.payload,
        },
      };

    case 'SET_ICE_CONNECTION_STATE':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          iceConnectionState: action.payload,
        },
      };

    case 'SET_SIGNALING_STATE':
      return {
        ...state,
        webrtcState: {
          ...state.webrtcState,
          signalingState: action.payload,
        },
      };

    default:
      return state;
  }
}

export function useWebRTC({
  remotePeerId,
  onSendSignaling,
  onRemoteStream,
}: UseWebRTCOptions) {
  const [state, dispatch] = useReducer(webrtcReducer, initialState);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const remotePeerIdRef = useRef<string | null>(null);
  const onSendSignalingRef = useRef<((message: { type: string; to?: string; payload?: any }) => void) | undefined>(undefined);
  const onRemoteStreamRef = useRef<((stream: MediaStream) => void) | undefined>(undefined);

  // Синхронизация refs
  useEffect(() => {
    remotePeerIdRef.current = remotePeerId;
    onSendSignalingRef.current = onSendSignaling;
    onRemoteStreamRef.current = onRemoteStream;
  }, [remotePeerId, onSendSignaling, onRemoteStream]);

  // Получение списка камер
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      const selectedCameraId = videoDevices.length > 0 ? videoDevices[0]?.deviceId : undefined;
      dispatch({
        type: 'SET_CAMERAS',
        payload: {
          cameras: videoDevices,
          selectedCameraId,
        },
      });
      return videoDevices;
    } catch (err) {
      console.error("❌ Failed to enumerate devices:", err);
      return [];
    }
  }, []);

  // Инициализация локального медиа потока
  const initializeLocalStream = useCallback(async (cameraId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: cameraId
          ? { deviceId: { exact: cameraId }, width: { ideal: WEBRTC_CONFIG.VIDEO_WIDTH }, height: { ideal: WEBRTC_CONFIG.VIDEO_HEIGHT } }
          : { width: { ideal: WEBRTC_CONFIG.VIDEO_WIDTH }, height: { ideal: WEBRTC_CONFIG.VIDEO_HEIGHT } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      dispatch({
        type: 'SET_LOCAL_STREAM',
        payload: {
          stream,
          videoEnabled: stream.getVideoTracks()[0]?.enabled ?? true,
          audioEnabled: stream.getAudioTracks()[0]?.enabled ?? true,
        },
      });

      return stream;
    } catch (err) {
      console.error("❌ Failed to get media devices:", err);
      throw err;
    }
  }, []);

  // Создание PeerConnection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    // Закрываем существующее соединение
    if (pcRef.current) {
      console.log("🔄 Closing existing peer connection");
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({ iceServers: WEBRTC_CONFIG.ICE_SERVERS });

    // Добавляем локальные треки
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Обработка удаленных треков
    pc.ontrack = (event) => {
      console.log("🎥 Remote track received:", event.track.kind);
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        remoteStreamRef.current = stream;
        dispatch({ type: 'SET_REMOTE_STREAM', payload: stream });
        onRemoteStreamRef.current?.(stream);
      }
    };

    // Отправка ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && remotePeerIdRef.current && onSendSignalingRef.current) {
        onSendSignalingRef.current({
          type: "ice-candidate",
          to: remotePeerIdRef.current,
          payload: event.candidate,
        });
      }
    };

    // Отслеживание состояний
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      dispatch({ type: 'SET_CONNECTION_STATE', payload: state });
      console.log("🔗 Connection state:", state);
      
      if (state === "failed" || state === "disconnected") {
        // Используем прямой вызов hangup через ref, чтобы избежать проблем с замыканиями
        const currentPC = pcRef.current;
        if (currentPC) {
          currentPC.close();
          pcRef.current = null;
        }
        dispatch({ type: 'END_CALL' });
        onSendSignalingRef.current?.({ type: "hang-up" });
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      dispatch({ type: 'SET_ICE_CONNECTION_STATE', payload: state });
      console.log("❄️ ICE connection state:", state);
    };

    pc.onsignalingstatechange = () => {
      const state = pc.signalingState;
      dispatch({ type: 'SET_SIGNALING_STATE', payload: state });
      console.log("📡 Signaling state:", state);
    };

    pcRef.current = pc;
    return pc;
  }, []); // Убрали зависимости - используем refs

  // Обработка входящего offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit & { from?: string }) => {
    if (!offer.from) {
      console.error("❌ Offer received without 'from' field");
      return;
    }

    // Проверяем, что не идет уже звонок
    if (webrtcState.isCalling || webrtcState.callActive) {
      console.log("⚠️ Call already in progress, ignoring offer");
      return;
    }

    // Закрываем существующее соединение
    if (pcRef.current) {
      console.log("🔄 Closing existing peer connection before handling offer");
      pcRef.current.close();
      pcRef.current = null;
      iceCandidateQueueRef.current = [];
    }

    // Инициализируем локальный поток если нужно
    if (!localStreamRef.current) {
      await initializeLocalStream(mediaState.selectedCameraId);
    }

    if (!localStreamRef.current) {
      console.error("❌ Failed to get local stream");
      return;
    }

    // Проверяем еще раз после получения потока
    if (webrtcState.isCalling || webrtcState.callActive) {
      console.log("⚠️ Call started while getting stream, aborting offer handling");
      return;
    }

    const pc = createPeerConnection(localStreamRef.current);
    setWebRTCState((prev) => ({ ...prev, isCalling: true }));

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await processIceCandidateQueue(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      onSendSignalingRef.current?.({
        type: "answer",
        to: offer.from,
        payload: answer,
      });

      setWebRTCState((prev) => ({ ...prev, callActive: true }));
    } catch (err) {
      console.error("❌ Failed to handle offer:", err);
      setWebRTCState((prev) => ({ ...prev, isCalling: false }));
      // Закрываем соединение если оно было создано
      // Используем pc напрямую, так как он был создан выше
      try {
        pc.close();
      } catch (closeErr) {
        console.error("❌ Error closing peer connection:", closeErr);
      }
      pcRef.current = null;
    }
  }, [initializeLocalStream, createPeerConnection, mediaState.selectedCameraId, webrtcState.isCalling, webrtcState.callActive]);

  // Обработка входящего answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit & { from?: string }) => {
    if (!pcRef.current) {
      console.error("❌ PC not initialized when handling answer");
      return;
    }

    const currentState = pcRef.current.signalingState;
    if (currentState !== "have-local-offer") {
      if (currentState === "stable") {
        console.log("ℹ️ Connection already established, ignoring duplicate answer");
        return;
      }
      console.warn(`⚠️ Cannot set answer: wrong signaling state. Current: ${currentState}`);
      return;
    }

    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      await processIceCandidateQueue(pcRef.current);
      dispatch({ type: 'CALL_ACTIVE' });
    } catch (err) {
      console.error("❌ Failed to handle answer:", err);
      dispatch({ type: 'START_CALL' }); // Reset calling state
    }
  }, []);

  // Обработка ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current) {
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    if (pcRef.current.remoteDescription === null) {
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("❌ Failed to add ICE candidate:", err);
    }
  }, []);

  // Обработка очереди ICE candidates
  const processIceCandidateQueue = useCallback(async (pc: RTCPeerConnection) => {
    if (pc.remoteDescription === null) return;

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("❌ Failed to add queued ICE candidate:", err);
        }
      }
    }
  }, []);

  // Начало звонка (создание offer)
  const startCall = useCallback(async (targetPeerId?: string) => {
    // Проверяем, что уже не идет звонок
    if (state.webrtcState.isCalling || state.webrtcState.callActive) {
      console.log("⚠️ Call already in progress, ignoring startCall");
      return;
    }

    const peerToCall = targetPeerId || remotePeerIdRef.current;
    if (!peerToCall) {
      console.error("❌ Cannot start call: no target peer ID");
      return;
    }

    if (!localStreamRef.current) {
      await initializeLocalStream(state.mediaState.selectedCameraId);
    }

    if (!localStreamRef.current) {
      console.error("❌ Failed to get local stream");
      return;
    }

    // Проверяем еще раз после получения потока
    if (state.webrtcState.isCalling || state.webrtcState.callActive) {
      console.log("⚠️ Call started while getting stream, aborting");
      return;
    }

    const pc = createPeerConnection(localStreamRef.current);
    dispatch({ type: 'START_CALL' });

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      onSendSignalingRef.current?.({
        type: "offer",
        to: peerToCall,
        payload: offer,
      });
    } catch (err) {
      console.error("❌ Failed to create offer:", err);
      dispatch({ type: 'END_CALL' });
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    }
  }, [initializeLocalStream, createPeerConnection, state.mediaState.selectedCameraId, state.webrtcState]);

  // Завершение звонка
  const hangup = useCallback(() => {
    console.log("📞 Ending call...");

    // Всегда отправляем hang-up сигнал
    onSendSignalingRef.current?.({ type: "hang-up" });

    // Останавливаем все треки ПЕРЕД закрытием соединения
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log(`🎙️ Stopping ${track.kind} track`);
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        console.log(`🎬 Stopping remote ${track.kind} track`);
        track.stop();
      });
      remoteStreamRef.current = null;
    }

    // Закрываем соединение ПОСЛЕ остановки треков
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (err) {
        console.error("❌ Error closing peer connection:", err);
      }
      pcRef.current = null;
    }

    // Очищаем состояние
    dispatch({ type: 'END_CALL' });
    iceCandidateQueueRef.current = [];
    console.log("✅ Call ended, all resources cleaned up");
  }, []);

  // Переключение видео/аудио
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !state.mediaState.videoEnabled;
      });
      dispatch({ type: 'TOGGLE_VIDEO' });
    }
  }, [state.mediaState.videoEnabled]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !state.mediaState.audioEnabled;
      });
      dispatch({ type: 'TOGGLE_AUDIO' });
    }
  }, [state.mediaState.audioEnabled]);

  // Переключение камеры
  const switchCamera = useCallback(async (cameraId: string) => {
    if (!localStreamRef.current) return;

    try {
      const constraints: MediaStreamConstraints = {
        audio: state.mediaState.audioEnabled,
        video: {
          width: { ideal: WEBRTC_CONFIG.VIDEO_WIDTH },
          height: { ideal: WEBRTC_CONFIG.VIDEO_HEIGHT },
          deviceId: { exact: cameraId },
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];

      if (!newVideoTrack) {
        console.error("❌ Failed to get video track from new stream");
        return;
      }

      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }
      localStreamRef.current.addTrack(newVideoTrack);

      dispatch({ type: 'SELECT_CAMERA', payload: cameraId });
    } catch (err) {
      console.error("❌ Failed to switch camera:", err);
    }
  }, [state.mediaState.audioEnabled]);

  // Инициализация при монтировании - только один раз
  useEffect(() => {
    getCameras();
  }, [getCameras]);

  return {
    // State
    webrtcState: state.webrtcState,
    mediaState: state.mediaState,
    
    // Methods
    initializeLocalStream,
    startCall,
    hangup,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleVideo,
    toggleAudio,
    switchCamera,
    getCameras,
    
    // Refs (для прямого доступа к элементам)
    localStreamRef,
    remoteStreamRef,
  };
}

