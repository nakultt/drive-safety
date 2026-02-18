// eventService.ts
import api from './api';
import { ViolationEvent, EventSummary } from '../types/event.types';

export const fetchEvents = async (): Promise<ViolationEvent[]> => {
  const res = await api.get('/events');
  return res.data;
};

export const fetchEventSummary = async (): Promise<EventSummary> => {
  const res = await api.get('/events/summary');
  return res.data;
};

export const fetchEventTrend = async () => {
  const res = await api.get('/events/trend');
  return res.data;
};

export const fetchHeatmap = async () => {
  const res = await api.get('/events/heatmap');
  return res.data;
};

export const fetchTopOffenders = async () => {
  const res = await api.get('/events/top-offenders');
  return res.data;
};
