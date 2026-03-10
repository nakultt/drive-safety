// useLiveEvents.ts
import { useEffect, useRef, useState } from 'react';
import { fetchEvents } from '../services/eventService';
import type { ViolationEvent } from '../types/event.types';
import { useWebSocket } from './useWebSocket';

const FALLBACK_EVENTS: ViolationEvent[] = [
  {
    id: '1',
    plateNumber: 'MH12AB1234',
    violationType: 'Overspeeding',
    location: 'Main St',
    speed: 88,
    severity: 'High',
    fine: 1200,
    isRepeatOffender: true,
    imageUrl: '',
    plateImageUrl: '',
    riskScore: 88,
    timestamp: new Date().toISOString(),
    paid: false,
  },
  {
    id: '2',
    plateNumber: 'DL8CAF4321',
    violationType: 'Helmet',
    location: '2nd Ave',
    speed: 0,
    severity: 'Medium',
    fine: 200,
    isRepeatOffender: false,
    imageUrl: '',
    plateImageUrl: '',
    riskScore: 42,
    timestamp: new Date().toISOString(),
    paid: false,
  },
];

export function useLiveEvents() {
  const [events, setEvents] = useState<ViolationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const newestIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchEvents()
      .then((data) => {
        if (!mounted) return;
        // Normalize data to an array (API may sometimes return object or string on error)
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : FALLBACK_EVENTS;
        setEvents(normalized);
        if (normalized && normalized.length) newestIdRef.current = normalized[0].id;
      })
      .catch(() => {
        // fallback to sample data when backend not available
        setEvents(FALLBACK_EVENTS);
        setError('Unable to load events from API — using sample data');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // WebSocket: append new events in real-time
  useWebSocket((msg) => {
    if (!msg) return;
    try {
      const event: ViolationEvent = typeof msg === 'string' ? JSON.parse(msg) : msg;
      // dedupe by id
      if (event?.id && event.id === newestIdRef.current) return;
      newestIdRef.current = event.id;
      setEvents((prev) => [event, ...prev].slice(0, 100));
    } catch (e) {
      // ignore malformed
    }
  });

  const addEvent = (ev: ViolationEvent) => setEvents((prev) => [ev, ...prev].slice(0, 100));

  return { events, loading, error, addEvent };
}
