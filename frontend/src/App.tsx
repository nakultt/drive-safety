import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Violations from './pages/Violations';
import Distractions from './pages/Distractions';
import Potholes from './pages/Potholes';
import AnimalAlerts from './pages/AnimalAlerts';
import Analytics from './pages/Analytics';
import Devices from './pages/Devices';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Settings from './pages/Settings';
import Report from './pages/Report';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Main routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/distractions" element={<Distractions />} />
        <Route path="/potholes" element={<Potholes />} />
        <Route path="/animal-alerts" element={<AnimalAlerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/report" element={<Report />} />
        <Route path="/settings" element={<Settings />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
