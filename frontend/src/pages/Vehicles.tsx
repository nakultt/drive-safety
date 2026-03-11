import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, ShieldAlert, FileText, ChevronRight, X, CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        if (search.length > 0) {
          const res = await api.searchVehicles(search);
          setVehicles(res.data);
        } else {
          const res = await api.getVehicles(1, 20);
          setVehicles(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchVehicles, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleRowClick = async (plate: string) => {
    try {
      const res = await api.getVehicleDetail(plate);
      setSelectedVehicle(res.vehicle);
      setVehicleHistory(res.violations);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (score >= 4) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  const formatText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-white">Vehicle Profiles</h1>
           <p className="text-gray-400 mt-1">Track repeat offenders and review cumulative risk scores</p>
        </div>
        
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search license plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white shadow-sm"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: List */}
        <div className="lg:col-span-1 card p-0 flex flex-col overflow-hidden border border-[#30363d]">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
            <h3 className="font-semibold text-gray-200">Tracked Vehicles</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#0d1117]">
            {loading ? (
              <p className="text-center text-gray-500 py-8 text-sm">Loading...</p>
            ) : vehicles.length === 0 ? (
               <p className="text-center text-gray-500 py-8 text-sm">No vehicles found</p>
            ) : (
              vehicles.map(v => (
                <div 
                  key={v.number_plate}
                  onClick={() => handleRowClick(v.number_plate)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors flex justify-between items-center ${
                    selectedVehicle?.number_plate === v.number_plate
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-[#161b22] border-[#30363d] hover:border-gray-500'
                  }`}
                >
                  <div>
                    <div className="font-mono text-lg font-bold text-yellow-500 tracking-wider">
                      {v.number_plate}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {v.total_violations} incident(s)
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold border ${getRiskColor(v.risk_score)} flex items-center gap-1`}>
                    {v.risk_score >= 8 && <ShieldAlert size={12} />}
                    Risk: {v.risk_score}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detail */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden border border-[#30363d] p-0 relative">
          {!selectedVehicle ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 pb-16">
               <CarFront size={64} className="opacity-20 mb-4" />
               <p className="text-lg">Select a vehicle from the list to view its profile</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-[#30363d] bg-[#161b22] flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-mono font-bold text-yellow-500 tracking-widest mb-1 shadow-[0_4px_14px_0_rgba(234,179,8,0.1)]">
                     {selectedVehicle.number_plate}
                   </h2>
                   <p className="text-sm text-gray-400">
                     First seen: {new Date(selectedVehicle.first_seen).toLocaleDateString()}
                     <span className="mx-2">|</span>
                     Last seen: {new Date(selectedVehicle.last_seen).toLocaleDateString()}
                   </p>
                </div>
                
                <div className="flex gap-4 text-center">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 w-28">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Infractions</p>
                    <p className="text-2xl font-bold text-white leading-none">{selectedVehicle.total_violations}</p>
                  </div>
                  <div className={`border rounded-lg p-3 w-28 ${getRiskColor(selectedVehicle.risk_score)} bg-opacity-100`}>
                    <p className="text-xs uppercase font-semibold mb-1 opacity-80 text-white">Risk Score</p>
                    <p className="text-2xl font-bold leading-none">{selectedVehicle.risk_score}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-[#30363d] bg-[#0d1117]">
                 <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Violation Types Associated</h3>
                 <div className="flex flex-wrap gap-2">
                   {selectedVehicle.violation_types.map((type: string) => (
                      <span key={type} className="px-3 py-1.5 bg-[#1f232b] border border-[#30363d] rounded text-sm text-gray-300">
                        {formatText(type)}
                      </span>
                   ))}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#161b22] p-6">
                 <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Complete Incident History</h3>
                 
                 <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#30363d] before:to-transparent">
                   {vehicleHistory.map((item) => (
                     <div key={item.violation_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       
                       <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#30363d] bg-[#0d1117] text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                         <FileText size={16} />
                       </div>
                       
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-[#30363d] bg-[#1f232b] shadow-sm relative group-hover:border-blue-500/50 transition-colors">
                          <div className="flex items-center justify-between space-x-2 mb-2">
                             <div className="font-bold text-white text-sm">
                               {formatText(item.violation_type)}
                             </div>
                             <time className="text-xs text-gray-500 font-mono">
                               {new Date(item.timestamp).toLocaleDateString()}
                             </time>
                          </div>
                          
                          <div className="text-gray-400 text-xs flex justify-between">
                            <span>Camera: {item.camera_id}</span>
                            <span className={item.status === 'actioned' ? 'text-red-400 font-semibold' : ''}>{item.status}</span>
                          </div>
                          
                          <Link to="/violations" className="flex items-center gap-1 text-blue-400 text-xs font-semibold mt-3 hover:text-blue-300 w-max">
                            View context <ChevronRight size={12} />
                          </Link>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
              
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="absolute top-4 right-4 p-2 bg-[#0d1117] border border-[#30363d] rounded text-gray-400 hover:text-white hover:bg-[#30363d] transition-colors"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
