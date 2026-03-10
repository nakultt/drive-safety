// Dashboard.tsx
import { useEffect, useRef, useState } from 'react';
import Layout from '../components/layout/Layout';
import SummarySection from '../components/dashboard/SummarySection';
import TrendChart from '../components/dashboard/TrendChart';
import ViolationFeed from '../components/dashboard/ViolationFeed';
import AlertToast from '../components/common/AlertToast';
import Loader from '../components/common/Loader';
import { useLiveEvents } from '../hooks/useLiveEvents';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Dashboard() {
  const { events, loading: eventsLoading, error: eventsError } = useLiveEvents();
  const { trend, loading: analyticsLoading } = useAnalytics();
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const prevFirstId = useRef<string | null>(null);

  // notify on new high-severity event
  useEffect(() => {
    if (!events || events.length === 0) return;
    const first = events[0];
    if (prevFirstId.current && prevFirstId.current !== first.id) {
      if (first.severity === 'High') {
        setToast({ type: 'warning', message: `High severity: ${first.plateNumber} — ${first.violationType}` });
        // simple beep using WebAudio
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = 520;
          g.gain.value = 0.05;
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          setTimeout(() => { o.stop(); ctx.close(); }, 250);
        } catch {
          // ignore audio errors
        }
      }
    }
    prevFirstId.current = first.id;
  }, [events]);

  return (
    <Layout>
      {(eventsLoading || analyticsLoading) && <Loader />}
      {toast && <AlertToast type={toast.type} message={toast.message} />}

      <div className="flex flex-col gap-8">
        <SummarySection events={events} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TrendChart data={trend} />
          </div>
          <div>
            <ViolationFeed events={events} />
          </div>
        </div>

        {eventsError && <div className="text-sm text-red-500">{eventsError}</div>}
      </div>
    </Layout>
  );
}

