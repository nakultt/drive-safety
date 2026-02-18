// analyticsService.ts
import api from './api';

export const fetchViolationDistribution = async () => {
  const res = await api.get('/events/summary');
  return res.data;
};

export const fetchTrendData = async () => {
  const res = await api.get('/events/trend');
  return res.data;
};

export const fetchLocationAnalysis = async () => {
  const res = await api.get('/events/heatmap');
  return res.data;
};
