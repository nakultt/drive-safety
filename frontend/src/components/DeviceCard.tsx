import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import Badge from './Badge';
import type { Device } from '../data/mockData';

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const isOnline = device.status === 'online';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{device.deviceId}</h3>
          <p className="text-sm text-slate-500 mt-1">{device.location}</p>
        </div>
        <Badge variant={isOnline ? 'success' : 'error'} size="sm">
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {device.status}
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Last Active</span>
          <span className="font-medium text-slate-900">{device.lastActiveTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total Events</span>
          <span className="font-medium text-slate-900">{device.totalEventsDetected}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Firmware</span>
          <span className="font-medium text-slate-900">{device.firmwareVersion}</span>
        </div>
      </div>

      {isOnline && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">CPU Usage</span>
              <span className="font-medium text-slate-900">{device.cpuUsage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  device.cpuUsage > 80 ? 'bg-red-500' : device.cpuUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${device.cpuUsage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Memory Usage</span>
              <span className="font-medium text-slate-900">{device.memoryUsage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  device.memoryUsage > 80 ? 'bg-red-500' : device.memoryUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${device.memoryUsage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Uptime</span>
              <span className="font-medium text-slate-900">{device.uptime}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${device.uptime}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
