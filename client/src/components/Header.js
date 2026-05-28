import React from 'react';

const navItems = [
  { id: 'home', label: 'Overview', icon: '⬡' },
  { id: 'analyze', label: 'Eligibility Check', icon: '◈' },
  { id: 'results', label: 'Dashboard', icon: '◉' },
  { id: 'simulator', label: 'What-If Simulator', icon: '⟁' },
];

export default function Header({ darkMode, setDarkMode, activeSection, setActiveSection }) {
  const bg = darkMode ? 'bg-[#090D1A]/80 border-[#1E2D4D]' : 'bg-white/80 border-gray-200';

  return (
    <header className={`sticky top-0 z-50 ${bg} backdrop-blur-xl border-b px-4 md:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4`}>
      {/* Logo Area */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00E5FF22, #00FF8722)', border: '1px solid rgba(0,229,255,0.4)' }}>
            <span className="text-lg">◈</span>
          </div>
          <div>
            <h1 className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-teal-400 to-blue-500' : 'from-blue-600 to-teal-500'}`}>
              SmartBNPL AI
            </h1>
          </div>
        </div>
        
        {/* Dark mode toggle for mobile (shows here instead of right side on small screens) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
            ${darkMode ? 'bg-[#0F1629] border border-[#1E2D4D] text-yellow-300' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>

      {/* Horizontal Nav */}
      <nav className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide flex-1 lg:justify-center">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${isActive 
                  ? (darkMode ? 'bg-[#00E5FF15] text-[#00E5FF] border border-[#00E5FF30]' : 'bg-blue-50 text-blue-700 border border-blue-200')
                  : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-[#0F1629]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')
                }`}
            >
              <span className="text-xs">{item.icon}</span>
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
          className={`hidden lg:flex w-10 h-10 rounded-xl items-center justify-center transition-all duration-200
            ${darkMode ? 'bg-[#0F1629] border border-[#1E2D4D] hover:border-[#00E5FF40] text-yellow-300' : 'bg-gray-100 border border-gray-200 hover:border-blue-300 text-gray-600'}`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  );
}
