import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultDashboard from './components/ResultDashboard';
import WhatIfSimulator from './components/WhatIfSimulator';
import LandingHero from './components/LandingHero';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    document.body.className = darkMode ? '' : 'light';
  }, [darkMode]);

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
    <div className={`app-shell min-h-screen flex flex-col ${darkMode ? 'hero-mesh bg-dots' : 'hero-mesh-light'}`}>
      
      {/* Horizontal Nav Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-6 w-full max-w-7xl mx-auto">
        {activeSection === 'home' && (
          <LandingHero
            darkMode={darkMode}
            onGetStarted={() => setActiveSection('analyze')}
            onOpenSimulator={() => setActiveSection('simulator')}
          />
        )}

        {activeSection === 'analyze' && (
          <InputForm
            darkMode={darkMode}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeSection === 'results' && (
          <ResultDashboard
            result={analysisResult}
            formData={formData}
            darkMode={darkMode}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {activeSection === 'simulator' && (
          <WhatIfSimulator 
            darkMode={darkMode} 
            initialData={formData} 
            onGoToForm={() => setActiveSection('analyze')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
