import React from 'react';
import { Eye, Clock, Smartphone } from 'lucide-react';
import Layout from '../layouts/Layout';
import Badge from '../components/Badge';
import { mockDistractions } from '../data/mockData';

const Distractions: React.FC = () => {
  return (
    <Layout title="Driver Distractions">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDistractions.map((distraction) => (
          <div key={distraction.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <img
              src={distraction.imageUrl}
              alt="Distraction"
              className="w-full h-48 object-cover"
            />

            {/* Content */}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {distraction.vehicleNumber}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Driver: {distraction.driverId}
                  </p>
                </div>
                <Badge
                  variant={distraction.severity === 'high' ? 'error' : distraction.severity === 'medium' ? 'warning' : 'info'}
                  size="sm"
                >
                  <span className="capitalize">{distraction.severity}</span>
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Phone Detection</p>
                    <p className="text-sm font-medium text-slate-900">
                      {distraction.phoneDetected ? 'Detected' : 'Not Detected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Duration</p>
                    <p className="text-sm font-medium text-slate-900">{distraction.duration}s</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Timestamp</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(distraction.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button className="w-full px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm hover:bg-indigo-100 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {mockDistractions.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No distraction records found</p>
        </div>
      )}
    </Layout>
  );
};

export default Distractions;
