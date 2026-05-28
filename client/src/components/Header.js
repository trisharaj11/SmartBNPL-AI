import React from 'react';

const sectionTitles = {
  home: 'Overview',
  analyze: 'Eligibility Analysis',
  results: 'Analysis Dashboard',
  simulator: 'What-If Simulator',
};

export default function Header({ darkMode, setDarkMode, onMenuClick, activeSection, isLoggedIn, user, onLogout, onLoginClick }) {
  const bg = darkMode ? 'bg-[#090D1A]/80 border-[#1E2D4D]' : 'bg-white/80 border-gray-200';

  return (
    <header className={`sticky top-0 z-50 ${bg} backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-[#0F1629]' : 'hover:bg-gray-100'} transition-colors`}
        >
          <svg className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {sectionTitles[activeSection] || 'SmartBNPL AI'}
          </h1>
          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            Responsible BNPL Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Auth Buttons */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3 mr-2">
            <span className={`text-sm hidden sm:block ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Hi, {user?.name.split(' ')[0]}
            </span>
            <button
              onClick={onLogout}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                darkMode ? 'border-red-900 text-red-400 hover:bg-red-900/30' : 'border-red-200 text-red-600 hover:bg-red-50'
              }`}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors mr-2 ${
              darkMode ? 'border-purple-500 text-purple-400 hover:bg-purple-900/30' : 'border-purple-300 text-purple-600 hover:bg-purple-50'
            }`}
          >
            Log In / Sign Up
          </button>
        )}

        {/* Live indicator */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${darkMode ? 'bg-[#0F1629] text-slate-400 border border-[#1E2D4D]' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse"></span>
          Live Analysis Engine
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${darkMode ? 'bg-[#0F1629] border border-[#1E2D4D] hover:border-[#00E5FF40] text-yellow-300' : 'bg-gray-100 border border-gray-200 hover:border-blue-300 text-gray-600'}`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  );
}
