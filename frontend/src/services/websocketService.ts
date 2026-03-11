// websocketService.ts
let ws: WebSocket | null = null;

import { WS_BASE_URL } from './api';

export function connectWebSocket(onMessage: (data: any) => void) {
  try {
    ws = new WebSocket(`${WS_BASE_URL}/ws/events`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        // ignore malformed
      }
    };
    ws.onerror = () => {
      // swallow errors — hook should handle missing backend gracefully
      console.warn('WebSocket error');
    };
  } catch (err) {
    console.warn('Could not connect to WebSocket server');
  }
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
