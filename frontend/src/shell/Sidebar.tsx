import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Map as MapIcon,
  GitFork,
  Bell,
  LineChart,
  ActivitySquare,
  FlaskConical,
  FileCheck2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useTranslation();
  const { alerts, theme } = useAppStore();

  const navItems = [
    { to: '/console', label: t('nav.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/console/map', label: t('nav.map'), icon: MapIcon },
    { to: '/console/cascade', label: t('nav.cascadeVision'), icon: GitFork, badge: 'P0' },
    { to: '/console/alerts', label: t('nav.alerts'), icon: Bell, count: alerts.length },
    { to: '/console/risk', label: t('nav.riskAnalytics'), icon: LineChart },
    { to: '/console/impact', label: t('nav.impact'), icon: ActivitySquare },
    { to: '/console/lab', label: t('nav.responseLab'), icon: FlaskConical, badge: 'P0' },
    { to: '/console/evidence', label: t('nav.evidence'), icon: FileCheck2 },
    { to: '#reports', label: t('nav.reports'), icon: FileText, disabled: true, tag: t('nav.comingLater') },
    { to: '/console/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${
          theme === 'dark'
            ? 'bg-navy-900 border-navy-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className={`h-16 px-4 flex items-center justify-between border-b shrink-0 ${
          theme === 'dark' ? 'border-navy-800' : 'border-slate-100'
        }`}>
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden"
            title="Crisiscope X — AI for a Safer Tomorrow"
          >
            <div className="w-9 h-9 rounded-xl bg-signal-blue flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              CX
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-base tracking-tight leading-none truncate ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Crisiscope X
                </span>
                <span className={`text-[10px] font-medium truncate mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  AI for a Safer Tomorrow
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-navy-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed select-none ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={`${item.label} (${item.tag})`}
                >
                  <Icon className="w-5 h-5 shrink-0 opacity-60" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm truncate">{item.label}</span>
                      {item.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          theme === 'dark' ? 'bg-navy-800 text-slate-400 border-navy-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-signal-blue text-white shadow-sm font-semibold'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.2 bg-risk-red text-white text-[10px] font-bold rounded-full">
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          theme === 'dark' ? 'bg-navy-950/60 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Prototype Disclaimer */}
        {!isCollapsed && (
          <div className={`p-3 m-3 rounded-card border text-[11px] ${
            theme === 'dark'
              ? 'bg-navy-950/70 border-navy-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className={`flex items-center gap-1.5 font-semibold mb-1 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulated Prototype</span>
            </div>
            <p className="leading-snug">
              Not an official emergency warning system.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
