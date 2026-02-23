// TrendChart.tsx
export default function TrendChart({ data }: { data?: { date: string; count: number }[] | Record<string, any> }) {
  const defaultData = [
    { date: 'Mon', count: 0 },
    { date: 'Tue', count: 0 },
    { date: 'Wed', count: 0 },
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 0 },
    { date: 'Sat', count: 0 },
    { date: 'Sun', count: 0 },
  ];

  // Normalize incoming `data` to an array of {date,count}
  const chartData: { date: string; count: number }[] = (() => {
    if (Array.isArray(data)) return data as any;
    if (!data) return defaultData;
    // handle { data: [...] } or { series: [...] }
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray((data as any).series)) return (data as any).series;
    // convert record-like { 'MM/DD/YYYY': number }
    const keys = Object.keys(data);
    if (keys.length && keys.every(k => typeof (data as any)[k] === 'number')) {
      return keys.map(k => ({ date: k, count: Number((data as any)[k]) }));
    }
    // last-resort fallback
    // eslint-disable-next-line no-console
    console.error('TrendChart received unexpected `data` shape:', data);
    return defaultData;
  })();

  // Lightweight, dependency-free fallback visualization (stable and fast)
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">7-Day Violation Trend</h3>
      <div className="w-full h-[220px] flex items-end gap-3 px-2">
        {chartData.map((d, i) => {
          const height = Math.min(200, (d.count || 0) * 8 + 8);
          return <div key={i} className="bg-blue-500 rounded-t-md" style={{ flex: 1, height: `${height}px` }} />;
        })}
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-gray-500">
        {chartData.map((d, i) => (
          <div key={i} className="text-center">{d.date}</div>
        ))}
      </div>
    </div>
  );
}
