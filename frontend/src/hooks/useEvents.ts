// useEvents.ts
import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/eventService';
import { ViolationEvent } from '../types/event.types';

export function useEvents() {
  const [events, setEvents] = useState<ViolationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}
