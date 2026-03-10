import { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { Camera, AlertTriangle, Car, TrendingUp, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface Summary {
  today_total: number;
  week_total: number;
  month_total: number;
  by_type: Record<string, number>;
  by_camera: Record<string, number>;
  hourly_heatmap: number[];
  top_locations: { location: string; count: number }[];
}

const COLORS = ['#58a6ff', '#2ea043', '#d29922', '#f85149', '#8957e5', '#d1d5db'];

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsSummary(),
      api.getLiveStatus(),
      api.getViolations({ limit: 5 })
    ]).then(([sumReq, statusReq, recentReq]) => {
      setSummary(sumReq);
      setLiveStatus(statusReq);
      setRecent(recentReq.data);
    }).catch(console.error);
  }, []);

  if (!summary) return <div className="p-8 text-gray-400">Loading dashboard...</div>;

  const pieData = Object.entries(summary.by_type).map(([name, value]) => ({ name, value }));
  const hourlyData = summary.hourly_heatmap.map((count, hour) => ({ hour: `${hour}:00`, count }));

  const formatText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">High-level traffic enforcement metrics</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Today's Violations</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{summary.today_total}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-gray-400">Week total: {summary.week_total}</span>
          </div>
        </div>

        <div className="card border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Cameras</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{liveStatus?.active_cameras || 0}</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <Camera size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">System online</span>
          </div>
        </div>

        <div className="card border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Last Hour</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{liveStatus?.violations_last_hour || 0}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm focus">
            <span className="text-gray-400">Recent detection rate</span>
          </div>
        </div>
        
        <div className="card border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Unique Vehicles (Month)</p>
              <h3 className="text-3xl font-bold mt-2 text-white">~{Math.round(summary.month_total * 0.85)}</h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <Car size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">Estimated unique plates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">Today's Hourly Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                  <XAxis dataKey="hour" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
                    itemStyle={{ color: '#58a6ff' }}
                  />
                  <Bar dataKey="count" fill="#58a6ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card flex gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-6">Violation Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4 border-l border-[#30363d] pl-6">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-gray-300">{formatText(d.name)}</span>
                  </div>
                  <span className="font-semibold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feed */}
        <div className="space-y-6">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Recent Detections</h3>
              <span className="badge badge-info animate-pulse">Live</span>
            </div>
            
            <div className="space-y-4">
              {recent.map((v) => (
                <div key={v.violation_id} className="p-3 rounded-lg border border-[#30363d] bg-[#1f232b] hover:border-[#58a6ff] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white text-sm">{formatText(v.violation_type)}</span>
                    <span className={`badge ${
                      v.status === 'pending' ? 'badge-warning' : 
                      v.status === 'actioned' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Camera size={12} className="text-gray-500" />
                      {v.camera_id}
                    </div>
                    <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {v.number_plate && (
                    <div className="mt-3 inline-block bg-[#0d1117] border border-[#30363d] px-2 py-1 rounded text-xs font-mono font-bold text-yellow-500 tracking-wider">
                      {v.number_plate}
                    </div>
                  )}
                  
                  {v.annotated_image_path && (
                    <div className="mt-3 aspect-video rounded overflow-hidden border border-[#30363d]">
                      <img 
                        src={`${API_BASE_URL}${v.annotated_image_path}`} 
                        alt="Violation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
