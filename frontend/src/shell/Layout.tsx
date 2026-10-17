import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSpotlight, useTilt3D } from '../hooks/useFx';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DecisionStrip } from './DecisionStrip';
import { useAppStore } from '../store/useAppStore';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { loadAllData, theme } = useAppStore();
  const location = useLocation();
  useTilt3D();
  const bgRef = useSpotlight<HTMLDivElement>();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div
      className={`relative min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-navy-950 text-slate-100' : 'bg-mist text-slate-800'
      }`}
    >
      <div key={"bar-" + location.pathname} className="cx-route-bar" aria-hidden="true" />
      {/* Futuristic animated backdrop */}
      <div ref={bgRef} className="cx-bg" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="cx-grid" />
        <div className="cx-spot" />
        <div className="cx-scanline" />
      </div>
      {/* Sidebar (fixed left) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`relative z-10 flex-1 flex flex-col transition-all duration-300 ease-in-out ${
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
        <main
          key={location.pathname}
          className="flex-1 p-4 lg:p-6 overflow-y-auto"
          style={{ animation: 'cx-page-in .55s cubic-bezier(.2,.8,.2,1) both' }}
        >
          <div className="cx-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
