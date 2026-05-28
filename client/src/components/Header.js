import React from 'react';
import { BarChart3, Calculator, Gauge, Home, Moon, ShieldCheck, Sun } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'analyze', label: 'Eligibility Check', icon: ShieldCheck },
  { id: 'results', label: 'Dashboard', icon: BarChart3 },
  { id: 'simulator', label: 'Simulator', icon: Calculator },
];

export default function Header({ darkMode, setDarkMode, activeSection, setActiveSection }) {
  const bg = darkMode ? 'bg-[#090D1A]/80 border-[#1E2D4D]' : 'bg-white/80 border-gray-200';

  return (
    <header className={`sticky top-0 z-50 ${bg} backdrop-blur-xl border-b px-4 md:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4`}>
      {/* Logo Area */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: darkMode ? '#0F172A' : '#EFF6FF', border: '1px solid rgba(56,189,248,0.35)' }}>
            <Gauge size={18} color={darkMode ? '#38BDF8' : '#0369A1'} />
          </div>
          <div>
            <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              SmartBNPL AI
            </h1>
            <p className={`text-[11px] leading-none ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Affordability engine</p>
          </div>
        </div>
        
        {/* Dark mode toggle for mobile (shows here instead of right side on small screens) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
            ${darkMode ? 'bg-[#0F1629] border border-[#1E2D4D] text-yellow-300' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Horizontal Nav */}
      <nav className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide flex-1 lg:justify-center">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${isActive 
                  ? (darkMode ? 'bg-[#38BDF815] text-[#38BDF8] border border-[#38BDF830]' : 'bg-blue-50 text-blue-700 border border-blue-200')
                  : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0F1629]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')
                }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right side controls */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-end">

        {/* Dark mode toggle (desktop) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`hidden lg:flex w-10 h-10 rounded-lg items-center justify-center transition-all duration-200
            ${darkMode ? 'bg-[#0F1629] border border-[#1E2D4D] hover:border-[#38BDF840] text-yellow-300' : 'bg-gray-100 border border-gray-200 hover:border-blue-300 text-gray-600'}`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
