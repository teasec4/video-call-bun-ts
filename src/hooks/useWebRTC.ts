import { useRef, useState, useCallback, useEffect } from "react";
import type { WebRTCState, MediaState } from "../types/webrtc";

interface UseWebRTCOptions {
  remotePeerId: string | null;
  onSendSignaling?: (message: { type: string; to?: string; payload?: any }) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC({
  remotePeerId,
  onSendSignaling,
  onRemoteStream,
}: UseWebRTCOptions) {
  const [webrtcState, setWebRTCState] = useState<WebRTCState>({
    isCalling: false,
    callActive: false,
    connectionState: null,
    iceConnectionState: null,
    signalingState: null,
  });

  const [mediaState, setMediaState] = useState<MediaState>({
    localStream: null,
    remoteStream: null,
    videoEnabled: true,
    audioEnabled: true,
    cameras: [],
    selectedCameraId: "",
  });

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
      setMediaState((prev) => {
        const newState = { ...prev, cameras: videoDevices };
        // Устанавливаем выбранную камеру только если она еще не установлена
        if (videoDevices.length > 0 && !newState.selectedCameraId) {
          const firstCamera = videoDevices[0];
          if (firstCamera) {
            newState.selectedCameraId = firstCamera.deviceId;
          }
        }
        return newState;
      });
      return videoDevices;
    } catch (err) {
      console.error("❌ Failed to enumerate devices:", err);
      return [];
    }
  }, []); // Убрали зависимость от mediaState.selectedCameraId

  // Инициализация локального медиа потока
  const initializeLocalStream = useCallback(async (cameraId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: cameraId
          ? { deviceId: { exact: cameraId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setMediaState((prev) => ({
        ...prev,
        localStream: stream,
        videoEnabled: stream.getVideoTracks()[0]?.enabled ?? true,
        audioEnabled: stream.getAudioTracks()[0]?.enabled ?? true,
      }));

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

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

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
        setMediaState((prev) => ({ ...prev, remoteStream: stream }));
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
      setWebRTCState((prev) => ({ ...prev, connectionState: state }));
      console.log("🔗 Connection state:", state);
      
      if (state === "failed" || state === "disconnected") {
        // Используем прямой вызов hangup через ref, чтобы избежать проблем с замыканиями
        const currentPC = pcRef.current;
        if (currentPC) {
          currentPC.close();
          pcRef.current = null;
        }
        setWebRTCState((prev) => ({
          ...prev,
          isCalling: false,
          callActive: false,
          connectionState: null,
          iceConnectionState: null,
          signalingState: null,
        }));
        setMediaState((prev) => ({
          ...prev,
          remoteStream: null,
        }));
        onSendSignalingRef.current?.({ type: "hang-up" });
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setWebRTCState((prev) => ({ ...prev, iceConnectionState: state }));
      console.log("❄️ ICE connection state:", state);
    };

    pc.onsignalingstatechange = () => {
      const state = pc.signalingState;
      setWebRTCState((prev) => ({ ...prev, signalingState: state }));
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
      setWebRTCState((prev) => ({ ...prev, callActive: true }));
    } catch (err) {
      console.error("❌ Failed to handle answer:", err);
      setWebRTCState((prev) => ({ ...prev, isCalling: false }));
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
    if (webrtcState.isCalling || webrtcState.callActive) {
      console.log("⚠️ Call already in progress, ignoring startCall");
      return;
    }

    const peerToCall = targetPeerId || remotePeerIdRef.current;
    if (!peerToCall) {
      console.error("❌ Cannot start call: no target peer ID");
      return;
    }

    if (!localStreamRef.current) {
      await initializeLocalStream(mediaState.selectedCameraId);
    }

    if (!localStreamRef.current) {
      console.error("❌ Failed to get local stream");
      return;
    }

    // Проверяем еще раз после получения потока
    if (webrtcState.isCalling || webrtcState.callActive) {
      console.log("⚠️ Call started while getting stream, aborting");
      return;
    }

    const pc = createPeerConnection(localStreamRef.current);
    setWebRTCState((prev) => ({ ...prev, isCalling: true }));

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
      setWebRTCState((prev) => ({ ...prev, isCalling: false }));
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    }
  }, [initializeLocalStream, createPeerConnection, mediaState.selectedCameraId, webrtcState.isCalling, webrtcState.callActive]);

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
    setWebRTCState({
      isCalling: false,
      callActive: false,
      connectionState: null,
      iceConnectionState: null,
      signalingState: null,
    });

    setMediaState((prev) => ({
      ...prev,
      localStream: null,
      remoteStream: null,
    }));

    iceCandidateQueueRef.current = [];
    console.log("✅ Call ended, all resources cleaned up");
  }, []); // Убрали зависимость - используем ref

  // Переключение видео/аудио
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !mediaState.videoEnabled;
      });
      setMediaState((prev) => ({ ...prev, videoEnabled: !prev.videoEnabled }));
    }
  }, [mediaState.videoEnabled]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !mediaState.audioEnabled;
      });
      setMediaState((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    }
  }, [mediaState.audioEnabled]);

  // Переключение камеры
  const switchCamera = useCallback(async (cameraId: string) => {
    if (!localStreamRef.current) return;

    try {
      const constraints: MediaStreamConstraints = {
        audio: mediaState.audioEnabled,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
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

      setMediaState((prev) => ({ ...prev, selectedCameraId: cameraId }));
    } catch (err) {
      console.error("❌ Failed to switch camera:", err);
    }
  }, [mediaState.audioEnabled]);

  // Инициализация при монтировании - только один раз
  useEffect(() => {
    getCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Вызываем только при монтировании

  return {
    // State
    webrtcState,
    mediaState,
    
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

