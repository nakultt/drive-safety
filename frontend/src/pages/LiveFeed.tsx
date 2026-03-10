import { useState } from 'react';
import { useViolationsWebSocket } from '../hooks/useWebSocket';
import { API_BASE_URL } from '../services/api';
import { ShieldCheck, MapPin, Camera, CarFront, FileText } from 'lucide-react';

export default function LiveFeed() {
  const { violations, isConnected } = useViolationsWebSocket();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
              )}
            </span>
            Real-time Feed
          </h1>
          <p className="text-gray-400 mt-1">Live traffic violations reported by edge cameras</p>
        </div>
        
        <div className="flex gap-4">
          <div className="card py-2 px-4 flex items-center gap-3">
            <ShieldCheck className="text-green-500" size={20} />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Feed Status</p>
              <p className="font-semibold text-white">{isConnected ? 'Connected' : 'Reconnecting...'}</p>
            </div>
          </div>
          <div className="card py-2 px-4 flex flex-col justify-center">
             <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Queue Size</p>
             <p className="font-bold text-lg text-white leading-none">{violations.length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {violations.map((v) => (
          <div key={v.violation_id} className="card animate-in slide-in-from-left fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Image Section */}
              <div className="w-full md:w-1/3 shrink-0">
                <div 
                  className="aspect-video rounded-lg overflow-hidden border border-[#30363d] cursor-pointer hover:border-[#58a6ff] transition-colors relative group"
                  onClick={() => setSelectedImage(v.annotated_image_path || v.image_path)}
                >
                  {v.annotated_image_path ? (
                    <img src={`${API_BASE_URL}${v.annotated_image_path}`} alt="Violation" className="w-full h-full object-cover" />
                  ) : v.image_path ? (
                    <img src={`${API_BASE_URL}${v.image_path}`} alt="Raw" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#0d1117] flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium">Click to expand</span>
                  </div>
                </div>
              </div>

              {/* Data Section */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-[#30363d] pb-3 mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-red-400">{formatText(v.violation_type)}</h2>
                      <p className="text-gray-400 text-sm mt-1">{new Date(v.timestamp).toLocaleString()}</p>
                    </div>
                    {v.number_plate ? (
                      <div className="border-2 border-yellow-500 bg-[#1f232b] px-3 py-1.5 rounded uppercase font-mono text-xl text-yellow-500 font-bold tracking-widest shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        {v.number_plate}
                      </div>
                    ) : (
                      <span className="badge badge-warning">Unidentified</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex items-start gap-2 text-gray-300">
                      <Camera className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block text-xs">Camera ID</span>
                        {v.camera_id} <span className="text-gray-500">({v.camera_source})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-gray-300">
                      <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block text-xs">Location</span>
                        {v.location_label || `${v.gps_lat}, ${v.gps_lng}`}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-gray-300">
                      <CarFront className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block text-xs">AI Confidence</span>
                        {(v.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {v.ai_summary && (
                  <div className="mt-4 bg-[#0d1117] border border-[#30363d] rounded p-3 text-sm text-gray-300 flex gap-3 items-start">
                    <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                    <p className="leading-relaxed">{v.ai_summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {violations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Radio size={48} className="mb-4 opacity-50" />
            <p>Waiting for live events...</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={`${API_BASE_URL}${selectedImage}`} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-[#30363d]"
          />
        </div>
      )}
    </div>
  );
}
