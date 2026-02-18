import { useState, useCallback } from "react";

const API_URL = "http://localhost:3030";

interface UseHttpOptions {
  onCreateRoom?: (roomId: string) => void;
  onJoinRoom?: (roomId: string) => void;
}

export function useHttp({ onCreateRoom, onJoinRoom }: UseHttpOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create",
          payload: {
            roomId: "",
            clientId,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const roomId = data.payload.roomId;

      onCreateRoom?.(roomId);
      return roomId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onCreateRoom]);

  const joinRoom = useCallback(
    async (roomId: string, clientId: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "join",
            payload: {
              roomId,
              clientId,
            },
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();

        onJoinRoom?.(data.payload.roomId);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onJoinRoom]
  );

  return {
    createRoom,
    joinRoom,
    loading,
    error,
  };
}