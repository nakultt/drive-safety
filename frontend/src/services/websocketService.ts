// websocketService.ts
let ws: WebSocket | null = null;

export function connectWebSocket(onMessage: (data: any) => void) {
  try {
    ws = new WebSocket('ws://localhost:8000/ws/events');
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
