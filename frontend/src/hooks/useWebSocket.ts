import { useState, useEffect, useCallback, useRef } from 'react';
import { WS_BASE_URL } from '../services/api';

export interface ViolationEvent {
  violation_id: string;
  violation_type: string;
  confidence: number;
  timestamp: string;
  camera_source: string;
  camera_id: string;
  gps_lat: number;
  gps_lng: number;
  location_label: string | null;
  number_plate: string | null;
  plate_confidence: number | null;
  image_path: string | null;
  annotated_image_path: string | null;
  plate_image_path: string | null;
  ai_summary: string | null;
  status: string;
}

export function useViolationsWebSocket() {
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(`${WS_BASE_URL}/ws/violations`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeout.current) {
        window.clearTimeout(reconnectTimeout.current);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'initial') {
          // Initial load of last 10 violations
          setViolations(data.data);
        } else if (data.type === 'pong') {
          // Heartbeat response
        } else if (data.violation_id) {
          // New violation event broadcast by backend manager
          setViolations((prev) => [data, ...prev].slice(0, 50)); // Keep last 50
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Auto reconnect
      reconnectTimeout.current = window.setTimeout(connect, 3000);
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    connect();

    // Heartbeat to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeout.current) window.clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [connect]);

  return { violations, isConnected };
}
