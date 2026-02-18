// websocketService.ts
let ws: WebSocket | null = null;

export function connectWebSocket(onMessage: (data: any) => void) {
  ws = new WebSocket('ws://localhost:8000/ws/events');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
