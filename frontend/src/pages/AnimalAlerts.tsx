import React from 'react';
import { AlertOctagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Layout from '../layouts/Layout';
import AlertCard from '../components/AlertCard';
import { mockAnimalAlerts } from '../data/mockData';

const AnimalAlerts: React.FC = () => {
  const animalIcons: Record<string, LucideIcon> = {
    Cow: AlertOctagon,
    Dog: AlertOctagon,
    Bird: AlertOctagon,
    Deer: AlertOctagon
  } as Record<string, LucideIcon>;

  return (
    <Layout title="Animal Alerts">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAnimalAlerts.map((alert) => {
          const Icon = animalIcons[alert.animalType] || AlertOctagon;
          return (
            <AlertCard
              key={alert.id}
              icon={Icon}
              title={`${alert.animalType} Alert`}
              description={`${alert.animalType} detected at ${alert.location}`}
              severity={alert.riskLevel}
              timestamp={new Date(alert.alertTime).toLocaleString()}
              imageUrl={alert.imageUrl}
              actionButton={{
                label: alert.alertStatus === 'active' ? 'Acknowledge' : 'View',
                onClick: () => {
                  console.log(`Alert action for ${alert.id}`);
                }
              }}
            />
          );
        })}
      </div>

      {mockAnimalAlerts.length === 0 && (
        <div className="text-center py-12">
          <AlertOctagon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No animal alerts found</p>
        </div>
      )}
    </Layout>
  );
};

export default AnimalAlerts;
