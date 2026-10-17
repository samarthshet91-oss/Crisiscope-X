import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shell/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { MapPage } from './features/map/MapPage';
import { CascadeVisionPage } from './features/cascade/CascadeVisionPage';
import { ResponseLabPage } from './features/lab/ResponseLabPage';
import { AlertsPage } from './features/alerts/AlertsPage';
import { RiskAnalyticsPage } from './features/risk/RiskAnalyticsPage';
import { ImpactPage } from './features/impact/ImpactPage';
import { EvidencePage } from './features/evidence/EvidencePage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Console Shell & Nested Feature Routes */}
        <Route path="/console" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="cascade" element={<CascadeVisionPage />} />
          <Route path="lab" element={<ResponseLabPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="risk" element={<RiskAnalyticsPage />} />
          <Route path="impact" element={<ImpactPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/console" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
