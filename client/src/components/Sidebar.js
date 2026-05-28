import React from 'react';

const navItems = [
  { id: 'home', label: 'Overview', icon: '⬡' },
  { id: 'analyze', label: 'Eligibility Check', icon: '◈' },
  { id: 'results', label: 'Dashboard', icon: '◉' },
  { id: 'simulator', label: 'What-If Simulator', icon: '⟁' },
];

export default function Sidebar({ darkMode, open, activeSection, setActiveSection, onClose, isLoggedIn, user, onLogout }) {
  const bg = darkMode
    ? 'bg-[#090D1A] border-[#1E2D4D]'
    : 'bg-white border-gray-200';
  const text = darkMode ? 'text-slate-300' : 'text-gray-600';
  const activeBg = darkMode
    ? 'bg-gradient-to-r from-[#00E5FF15] to-[#00FF8710] border border-[#00E5FF30] text-[#00E5FF]'
    : 'bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 text-blue-700';
  const hoverBg = darkMode ? 'hover:bg-[#0F1629]' : 'hover:bg-gray-50';

  return (
    <div className={`sidebar ${open ? 'open' : ''} ${bg} border-r flex flex-col`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00E5FF22, #00FF8722)', border: '1px solid rgba(0,229,255,0.4)' }}>
            <span className="text-lg">◈</span>
          </div>
          <div>
            <div className="font-bold text-sm gradient-text">SmartBNPL AI</div>
            <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Intelligence Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className={`text-xs font-semibold uppercase tracking-widest mb-4 px-3 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
          Navigation
        </div>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveSection(item.id); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${activeSection === item.id ? activeBg : `${text} ${hoverBg}`}`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Auth in Sidebar */}
      <div className={`px-4 py-4 border-t border-inherit flex justify-between items-center`}>
         {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                 {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                 <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
                 <button onClick={() => { onLogout(); onClose(); }} className="text-xs text-red-500 hover:underline">Logout</button>
              </div>
            </div>
         ) : (
            <button 
              onClick={() => { setActiveSection('auth'); onClose(); }}
              className={`w-full py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}
            >
              Sign In
            </button>
         )}
      </div>

      {/* Footer */}
      <div className={`px-6 py-5 border-t border-inherit`}>
        <div className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-400'} space-y-1`}>
          <div className="font-semibold gradient-text text-xs">SmartBNPL AI v2.0</div>
          <div>Powered by Anthropic × Fintech</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
