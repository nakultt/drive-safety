import React from 'react';
import Layout from '../layouts/Layout';
import DeviceCard from '../components/DeviceCard';
import { mockDevices } from '../data/mockData';

const Devices: React.FC = () => {
  return (
    <Layout title="Connected Devices">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Total Devices</p>
            <p className="text-3xl font-bold text-slate-900">{mockDevices.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Online Devices</p>
            <p className="text-3xl font-bold text-green-600">
              {mockDevices.filter((d) => d.status === 'online').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Offline Devices</p>
            <p className="text-3xl font-bold text-red-600">
              {mockDevices.filter((d) => d.status === 'offline').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDevices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </Layout>
  );
};

export default Devices;
