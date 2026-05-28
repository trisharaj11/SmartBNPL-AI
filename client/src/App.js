import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultDashboard from './components/ResultDashboard';
import WhatIfSimulator from './components/WhatIfSimulator';
import LandingHero from './components/LandingHero';
import Auth from './components/Auth';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.className = darkMode ? '' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setActiveSection('analyze');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setActiveSection('home');
  };

  // Protect routes function
  const handleSectionChange = (section) => {
    if (['analyze', 'results', 'simulator'].includes(section) && !isLoggedIn) {
      setActiveSection('auth');
    } else {
      setActiveSection(section);
    }
  };

  const handleAnalysisComplete = (result, data) => {
    setAnalysisResult(result);
    setFormData(data);
    setActiveSection('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewAnalysis = () => {
    setActiveSection('analyze');
    setAnalysisResult(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'hero-mesh bg-dots' : 'hero-mesh-light'}`}>
      {/* Sidebar */}
      <Sidebar
        darkMode={darkMode}
        open={sidebarOpen}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        onClose={() => setSidebarOpen(false)}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-90 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="main-content">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => setActiveSection('auth')}
        />

        <main className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
          {activeSection === 'home' && (
            <LandingHero
              darkMode={darkMode}
              onGetStarted={() => handleSectionChange('analyze')}
            />
          )}

          {activeSection === 'auth' && (
            <Auth darkMode={darkMode} onLoginSuccess={handleLoginSuccess} />
          )}

          {activeSection === 'analyze' && (
            <InputForm
              darkMode={darkMode}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {activeSection === 'results' && analysisResult && (
            <ResultDashboard
              result={analysisResult}
              formData={formData}
              darkMode={darkMode}
              onNewAnalysis={handleNewAnalysis}
            />
          )}

          {activeSection === 'simulator' && (
            <WhatIfSimulator darkMode={darkMode} initialData={formData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
