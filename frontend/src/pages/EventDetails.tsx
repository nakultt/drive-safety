import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, FileText, CheckCircle } from 'lucide-react';
import Layout from '../layouts/Layout';
import Badge from '../components/Badge';
import { mockEvents } from '../data/mockData';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <Layout title="Event Details">
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">Event not found</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Event Details">
      <div className="mb-6">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <img src={event.imageUrl} alt="Event" className="w-full h-96 object-cover" />
            </div>
          )}

          {/* Event Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.description}</h1>

            {event.vehicleNumber && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900">Vehicle Information</h3>
                </div>
                <p className="text-lg font-bold text-indigo-900">{event.vehicleNumber}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-medium mb-2">EVENT TYPE</p>
                <Badge variant="info" size="sm">
                  <span className="capitalize">{event.eventType}</span>
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-medium mb-2">SEVERITY</p>
                <Badge
                  variant={event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'info'}
                  size="sm"
                >
                  <span className="capitalize">{event.severity}</span>
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-medium mb-2">STATUS</p>
                <Badge
                  variant={event.status === 'resolved' ? 'success' : event.status === 'in-progress' ? 'warning' : 'default'}
                  size="sm"
                >
                  <span className="capitalize">{event.status}</span>
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-medium mb-2">LOCATION</p>
                <p className="font-semibold text-slate-900 text-sm">{event.location}</p>
              </div>
            </div>

            {/* Incident Details */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Incident Details</h3>
              <div className="space-y-3">
                {Object.entries(event.details).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                    <span className="text-sm text-slate-900 font-semibold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5"></div>
                  <div className="w-0.5 h-16 bg-slate-200"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Event Detected</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${event.status === 'in-progress' ? 'bg-amber-500' : event.status === 'resolved' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <div className="w-0.5 h-16 bg-slate-200"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm capitalize">{event.status}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Update Status
              </button>
              <button className="w-full px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium text-sm hover:bg-slate-200 transition-colors">
                View Evidence
              </button>
              <button className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors">
                Escalate
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600 text-xs font-medium mb-1">Event ID</p>
                <p className="text-slate-900 font-mono text-xs bg-slate-50 p-2 rounded">{event.id}</p>
              </div>
              <div>
                <p className="text-slate-600 text-xs font-medium mb-1">Timestamp</p>
                <p className="text-slate-900 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-600 text-xs font-medium mb-1">Location</p>
                <p className="text-slate-900 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;
