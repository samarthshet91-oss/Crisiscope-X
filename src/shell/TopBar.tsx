import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Clock,
  Bell,
  Globe,
  Settings,
  ChevronDown,
  Play,
  Menu,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { AVAILABLE_CITIES, ACTIVE_CITY } from '../config/city';
import { ModeBadge } from '../components/ModeBadge';

interface TopBarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    alerts,
    searchQuery,
    setSearchQuery,
    startGuidedDemo,
    guidedDemo,
  } = useAppStore();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [currentTimeIST, setCurrentTimeIST] = useState('16 Oct 2026, 18:20 IST');

  // Dynamic simulated clock or fixed formatted IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as DD Mon YYYY, HH:mm IST
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      };
      const formatted = new Intl.DateTimeFormat('en-IN', options).format(now);
      setCurrentTimeIST(`${formatted} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const handleModeCycle = () => {
    if (mode === 'Mock data') setMode('Live simulation');
    else if (mode === 'Live simulation') setMode('Replay');
    else setMode('Mock data');
  };

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-700/80 text-white px-4 flex items-center justify-between gap-3 sticky top-0 z-40 select-none">
      {/* Left: Mobile hamburger + Area selector + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Area Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-200 border border-navy-700 transition-colors"
            aria-expanded={isCityDropdownOpen}
          >
            <MapPin className="w-3.5 h-3.5 text-signal-blue" />
            <span className="truncate max-w-[130px] sm:max-w-none">
              {ACTIVE_CITY.name}, {ACTIVE_CITY.state}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-navy-950 border border-navy-700 rounded-card shadow-dropdown p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-navy-800">
                Operating Urban Basin
              </div>
              <div className="py-1 space-y-0.5">
                {AVAILABLE_CITIES.map((city) => (
                  <button
                    key={city.id}
                    disabled={!city.enabled}
                    onClick={() => setIsCityDropdownOpen(false)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                      city.enabled
                        ? 'bg-signal-blue/20 text-white font-medium'
                        : 'opacity-40 text-slate-400 cursor-not-allowed hover:bg-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">
                        {city.name}, {city.state}
                      </div>
                      {city.disabledReason && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {city.disabledReason}
                        </div>
                      )}
                    </div>
                    {city.enabled && <Check className="w-3.5 h-3.5 text-signal-blue" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[140px] max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full bg-navy-950/90 border border-navy-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-signal-blue transition-colors"
          />
        </div>
      </div>

      {/* Right: Clock, Mode badge, Alerts bell, Demo button, Language selector */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* IST Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 font-mono bg-navy-950/60 rounded-md border border-navy-800/80">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="tabular-nums">{currentTimeIST}</span>
        </div>

        {/* Mode Badge */}
        <ModeBadge mode={mode} onToggle={handleModeCycle} />

        {/* Guided Demo Button */}
        {!guidedDemo.isActive && (
          <button
            type="button"
            onClick={startGuidedDemo}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-signal-blue hover:bg-signal-blue-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{t('nav.startDemo')}</span>
          </button>
        )}

        {/* Scenario Alerts Bell */}
        <button
          type="button"
          onClick={() => navigate('/console/alerts')}
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          title={`${alerts.length} scenario alerts`}
          aria-label="View simulated alerts"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-risk-red text-white text-[10px] font-bold rounded-full border-2 border-navy-900 animate-pulse">
              {alerts.length}
            </span>
          )}
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 text-xs transition-colors"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="uppercase font-semibold">{i18n.language || 'en'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-navy-950 border border-navy-700 rounded-lg shadow-dropdown p-1 z-50 text-xs">
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                  i18n.language === 'en' ? 'bg-signal-blue text-white font-semibold' : 'text-slate-200 hover:bg-navy-800'
                }`}
              >
                <span>English</span>
                {i18n.language === 'en' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => changeLanguage('kn')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                  i18n.language === 'kn' ? 'bg-signal-blue text-white font-semibold' : 'text-slate-200 hover:bg-navy-800'
                }`}
              >
                <span>ಕನ್ನಡ (Kannada)</span>
                {i18n.language === 'kn' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                  i18n.language === 'hi' ? 'bg-signal-blue text-white font-semibold' : 'text-slate-200 hover:bg-navy-800'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                {i18n.language === 'hi' && <Check className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => navigate('/console/settings')}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          title="System settings"
          aria-label="System settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
