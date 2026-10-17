import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DecisionStrip } from './DecisionStrip';
import { GuidedDemoBanner } from '../features/scenarios/GuidedDemoBanner';
import { useAppStore } from '../store/useAppStore';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { loadAllData } = useAppStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col font-sans">
      {/* Sidebar (fixed left) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top bar */}
        <TopBar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        {/* Decision strip */}
        <DecisionStrip />

        {/* Page View Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Guided Demo floating banner if active */}
        <GuidedDemoBanner />
      </div>
    </div>
  );
};
