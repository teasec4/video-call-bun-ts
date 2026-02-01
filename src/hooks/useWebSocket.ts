import { useEffect, useRef, useState, useCallback } from "react";
import type { SignalingMessage, SignalingMessageType } from "../types/webrtc";
import { WS_URL } from "../config/api";

interface UseWebSocketOptions {
  roomId: string;
  peerId: string;
  onMessage?: (message: SignalingMessage) => void;
  onPeerConnected?: (peerId: string) => void;
  onRoomClosed?: (reason: string) => void;
}

export function useWebSocket({
  roomId,
  peerId,
  onMessage,
  onPeerConnected,
  onRoomClosed,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(
        `${WS_URL}/chat?peerId=${encodeURIComponent(peerId)}&roomId=${encodeURIComponent(roomId)}`
      );

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: SignalingMessage = JSON.parse(event.data.toString());
          console.log("📨 WebSocket message:", message.type, message);

          // Обработка специальных сообщений
          switch (message.type) {
            case "peer-connected":
              if (message.peerId) {
                setRemotePeerId(message.peerId);
                onPeerConnected?.(message.peerId);
              }
              break;

            case "room-closed":
              if (message.reason) {
                onRoomClosed?.(message.reason);
              }
              break;

            default:
              // Передаем все остальные сообщения в callback
              onMessage?.(message);
          }
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket closed");
        setIsConnected(false);
        setRemotePeerId(null);

        // Попытка переподключения
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay) as unknown as number;
        } else {
          console.error("❌ Max reconnection attempts reached");
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
    }
  }, [roomId, peerId, onMessage, onPeerConnected, onRoomClosed]);

  const send = useCallback((message: Omit<SignalingMessage, "from">) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn("⚠️ WebSocket not connected, cannot send message");
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setRemotePeerId(null);
  }, []);

  useEffect(() => {
    if (roomId && peerId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [roomId, peerId, connect, disconnect]);

  return {
    isConnected,
    remotePeerId,
    send,
    disconnect,
    reconnect: connect,
  };
}

