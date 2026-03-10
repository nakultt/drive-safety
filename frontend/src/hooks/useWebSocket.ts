// useWebSocket.ts
import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocketService';

export function useWebSocket(onMessage: (data: any) => void) {
  useEffect(() => {
    connectWebSocket(onMessage);
    return () => disconnectWebSocket();
  }, [onMessage]);
}
