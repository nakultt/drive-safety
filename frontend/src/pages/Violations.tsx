import { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { Filter, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Violations() {
  const [violations, setViolations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    violation_type: '',
    status: '',
    plate: ''
  });

  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await api.getViolations({ ...filters, page, limit: 15 });
      setViolations(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [page, filters]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateViolationStatus(id, newStatus);
      if (selectedViolation?.violation_id === id) {
        setSelectedViolation({ ...selectedViolation, status: newStatus });
      }
      fetchViolations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const formatText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Violations Log</h1>
          <p className="text-gray-400 mt-1">Review and manage detected traffic infractions ({total} total)</p>
        </div>
      </div>

      <div className="card mb-6 p-4 shrink-0 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select 
          name="violation_type"
          value={filters.violation_type} 
          onChange={handleFilterChange}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="triple_riding">Triple Riding</option>
          <option value="helmet_absence">No Helmet</option>
          <option value="wrong_side_driving">Wrong Side</option>
        </select>

        <select 
          name="status"
          value={filters.status} 
          onChange={handleFilterChange}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="actioned">Actioned</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            name="plate"
            placeholder="Search license plate..."
            value={filters.plate}
            onChange={handleFilterChange}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <Search size={16} className="absolute left-3 top-2 text-gray-500" />
        </div>
      </div>

      <div className="card flex-1 overflow-hidden flex flex-col p-0 border border-[#30363d]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161b22] sticky top-0 border-b border-[#30363d]">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-400">Time</th>
                <th className="px-6 py-4 font-medium text-gray-400">Type</th>
                <th className="px-6 py-4 font-medium text-gray-400">Plate</th>
                <th className="px-6 py-4 font-medium text-gray-400">Camera</th>
                <th className="px-6 py-4 font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : violations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No violations found</td></tr>
              ) : (
                violations.map((v) => (
                  <tr 
                    key={v.violation_id} 
                    onClick={() => setSelectedViolation(v)}
                    className="hover:bg-[#1f232b] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(v.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{formatText(v.violation_type)}</td>
                    <td className="px-6 py-4">
                      {v.number_plate ? (
                        <span className="font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                          {v.number_plate}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{v.camera_id}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        v.status === 'pending' ? 'badge-warning' : 
                        v.status === 'actioned' ? 'badge-danger' : 
                        v.status === 'dismissed' ? 'bg-gray-800 text-gray-400 border-gray-700' :
                        'badge-success'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-[#161b22] px-6 py-4 border-t border-[#30363d] flex items-center justify-between shrink-0">
          <span className="text-sm text-gray-400">
            Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary px-3 py-1 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page * 15 >= total}
              className="btn btn-secondary px-3 py-1 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#30363d] bg-[#0d1117]">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {formatText(selectedViolation.violation_type)}
                <span className="text-sm font-normal text-gray-500 font-mono">
                  ID: {selectedViolation.violation_id.slice(0,8)}...
                </span>
              </h2>
              <button 
                onClick={() => setSelectedViolation(null)}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#30363d] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
              <div className="w-full md:w-2/3 bg-black p-4 flex flex-col items-center justify-center gap-4">
                {selectedViolation.annotated_image_path ? (
                  <img src={`${API_BASE_URL}${selectedViolation.annotated_image_path}`} alt="Violation" className="max-w-full max-h-[500px] object-contain rounded border border-[#30363d]" />
                ) : (
                  <div className="w-full h-64 border border-[#30363d] border-dashed rounded flex items-center justify-center text-gray-600">
                    Image unavailable
                  </div>
                )}
                
                {selectedViolation.plate_image_path && (
                  <div className="mt-2 text-center w-full max-w-md">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">License Plate Crop</p>
                    <img src={`${API_BASE_URL}${selectedViolation.plate_image_path}`} alt="Plate crop" className="max-w-full h-auto mx-auto rounded border-2 border-yellow-500/50" />
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-1/3 border-l border-[#30363d] p-6 space-y-6 bg-[#161b22]">
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
                   <select 
                      value={selectedViolation.status}
                      onChange={(e) => handleStatusChange(selectedViolation.violation_id, e.target.value)}
                      className={`w-full bg-[#0d1117] border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        selectedViolation.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' :
                        selectedViolation.status === 'actioned' ? 'border-red-500/50 text-red-500' :
                        'border-[#30363d] text-white'
                      }`}
                   >
                     <option value="pending">Pending</option>
                     <option value="reviewed">Reviewed</option>
                     <option value="actioned">Actioned (Ticket Issued)</option>
                     <option value="dismissed">Dismissed (False Positive)</option>
                   </select>
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Details</label>
                   <div className="space-y-3 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-gray-300">
                      <div className="flex justify-between">
                         <span className="text-gray-500">Time:</span>
                         <span className="text-right">{new Date(selectedViolation.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Camera:</span>
                         <span className="text-right">{selectedViolation.camera_id}</span>
                      </div>
                      <div className="flex justify-between items-start">
                         <span className="text-gray-500 pt-1">Plate:</span>
                         {selectedViolation.number_plate ? (
                            <span className="font-mono bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">{selectedViolation.number_plate}</span>
                         ) : (
                            <span className="text-gray-600 italic">Not found</span>
                         )}
                      </div>
                      <div className="flex justify-between border-t border-[#30363d] pt-3 mt-3">
                         <span className="text-gray-500">AI Confidence:</span>
                         <span className="text-right">{(selectedViolation.confidence * 100).toFixed(1)}%</span>
                      </div>
                   </div>
                </div>

                {selectedViolation.ai_summary && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">AI Report</label>
                    <p className="text-sm p-4 bg-blue-500/5 text-blue-200 border border-blue-500/20 rounded-lg leading-relaxed">
                      {selectedViolation.ai_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
