// useAnalytics.ts
import { useEffect, useState } from 'react';
import { fetchViolationDistribution, fetchTrendData, fetchLocationAnalysis } from '../services/analyticsService';

export function useAnalytics() {
  const [distribution, setDistribution] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchViolationDistribution(),
      fetchTrendData(),
      fetchLocationAnalysis(),
    ])
      .then(([d, t, l]) => {
        setDistribution(d);
        setTrend(t);
        setLocation(l);
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return { distribution, trend, location, loading, error };
}
