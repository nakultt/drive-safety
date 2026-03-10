import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import { BarChart3, TrendingUp, MapPin, Map, Video } from 'lucide-react';

export default function Analytics() {
  const [period, setPeriod] = useState('7d');
  const [trends, setTrends] = useState<any[]>([]);
  const [byType, setByType] = useState<any[]>([]);
  const [byCamera, setByCamera] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [trendsRes, typeRes, camRes, hotRes] = await Promise.all([
          api.getAnalyticsTrends(period),
          api.getAnalyticsByType(),
          api.getAnalyticsByCamera(),
          api.getAnalyticsHotspots()
        ]);
        
        // Format dates for trends
        const formattedTrends = trendsRes.data.map((d: any) => ({
          ...d,
          dateLabel: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));

        setTrends(formattedTrends);
        setByType(typeRes.data);
        setByCamera(camRes.data);
        setHotspots(hotRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const formatText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const COLORS = ['#58a6ff', '#2ea043', '#d29922', '#f85149', '#8957e5', '#d1d5db'];

  if (loading && trends.length === 0) {
    return <div className="p-8 text-gray-400">Loading analytics data...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Advanced Analytics</h1>
          <p className="text-gray-400 mt-1">Deep dive into traffic violation patterns</p>
        </div>
        
        <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p 
                  ? 'bg-[#30363d] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Volume Trends over Time</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#58a6ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                <XAxis dataKey="dateLabel" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
                  itemStyle={{ color: '#58a6ff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#58a6ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Type Bar Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-green-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Violations by Type</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                <XAxis type="number" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="violation_type" 
                  tickFormatter={formatText} 
                  stroke="#c9d1d9" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={100} 
                />
                <RechartsTooltip 
                  formatter={(value: number) => [value, 'Incidents']}
                  labelFormatter={formatText}
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {byType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspots Map Data */}
        <div className="card flex flex-col h-full">
          <div className="flex items-center gap-2 border-b border-[#30363d] pb-4 mb-4">
            <Map className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Top GPS Hotspots</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
             {hotspots.length === 0 ? (
               <p className="text-gray-500 text-sm italic">No location data available to map hotspots.</p>
             ) : (
               hotspots.map((h, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                   <div className="flex items-center gap-3">
                     <div className="bg-red-500/10 text-red-500 p-2 rounded-full">
                       <MapPin size={16} />
                     </div>
                     <div>
                       <p className="text-white text-sm font-medium">Point [{h.lat.toFixed(3)}, {h.lng.toFixed(3)}]</p>
                       <p className="text-xs text-gray-500 mt-0.5">Focus: {formatText(h.dominant_type)}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-bold text-white">{h.count}</p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Events</p>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* By Camera Performance */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Video className="text-purple-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Camera Capture Performance</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {byCamera.map((c, i) => (
               <div key={i} className="p-4 rounded-xl border border-[#30363d] bg-[#161b22] relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50 transition-opacity group-hover:opacity-100"></div>
                 <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-semibold text-gray-300">{c.camera_id}</p>
                   <Camera size={14} className="text-gray-500" />
                 </div>
                 <p className="text-2xl font-bold text-white">{c.count}</p>
                 <p className="text-xs text-gray-500 mt-1 uppercase">Total Captures</p>
               </div>
            ))}
            {byCamera.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">No active cameras logging data.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
