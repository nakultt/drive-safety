import React from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import Layout from '../layouts/Layout';
import Badge from '../components/Badge';
import { mockPotholes } from '../data/mockData';

const Potholes: React.FC = () => {
  return (
    <Layout title="Pothole Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Potholes Grid */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPotholes.map((pothole) => (
              <div key={pothole.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Image */}
                <img
                  src={pothole.imageUrl}
                  alt="Pothole"
                  className="w-full h-48 object-cover"
                />

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {pothole.location}
                      </h3>
                    </div>
                    <Badge
                      variant={pothole.severity === 'high' ? 'error' : pothole.severity === 'medium' ? 'warning' : 'info'}
                      size="sm"
                    >
                      <span className="capitalize">{pothole.severity}</span>
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">Coordinates</p>
                        <p className="text-sm font-medium text-slate-900">
                          {pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">Detected</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(pothole.detectedTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">Status</p>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant={pothole.status === 'fixed' ? 'success' : pothole.status === 'reported' ? 'warning' : 'error'}
                            size="sm"
                          >
                            <span className="capitalize">{pothole.status}</span>
                          </Badge>
                          {pothole.reportId && (
                            <span className="text-xs text-slate-600 py-1">ID: {pothole.reportId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Potholes;
