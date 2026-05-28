import React, { useEffect, useState } from 'react';

const stats = [
  { label: 'Accuracy Rate', value: '98.7%', color: '#00FF87' },
  { label: 'Avg Decision Time', value: '<2s', color: '#00E5FF' },
  { label: 'Risk Models', value: '14+', color: '#9B59B6' },
  { label: 'BNPL Partners', value: '50+', color: '#FFB300' },
];

const features = [
  { icon: '◈', title: 'AI Eligibility Engine', desc: 'Multi-factor credit analysis using 14+ risk parameters' },
  { icon: '⟁', title: 'Smart EMI Calculator', desc: 'Reducing balance formula with real-time tenure comparison' },
  { icon: '◉', title: 'What-If Simulator', desc: 'Interactive scenario modeling for optimal repayment plans' },
  { icon: '⬡', title: 'Risk Intelligence', desc: 'Grade-based risk scoring with detailed factor analysis' },
];

function AnimatedCounter({ target, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) return;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}{suffix}</span>;
}

export default function LandingHero({ darkMode, onGetStarted }) {
  const cardBase = darkMode ? 'glass-card neon-border' : 'glass-card-light border border-blue-100 shadow-lg';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-16 relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00E5FF, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00FF87, transparent)' }} />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold"
          style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse"></span>
          AI-Powered BNPL Risk Intelligence v2.0
        </div>

        <h1 className={`text-4xl md:text-6xl font-bold mb-4 leading-tight ${textPrimary}`}>
          Responsible{' '}
          <span className="gradient-text">Buy Now Pay Later</span>
          <br />Intelligence Platform
        </h1>

        <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${textSecondary}`}>
          Advanced AI-driven eligibility scoring, EMI optimization, and risk analysis for modern BNPL lending — trusted by fintechs worldwide.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onGetStarted} className="btn-primary flex items-center gap-2">
            <span>Start Free Analysis</span>
            <span>→</span>
          </button>
          <button className={`px-8 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-200
            ${darkMode ? 'border-[#1E2D4D] text-slate-300 hover:border-[#00E5FF30] hover:text-[#00E5FF]' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            View Sample Report
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${cardBase} card-lift p-6 text-center`}>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={`text-xs ${textSecondary}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div>
        <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className={`${cardBase} card-lift p-6 flex items-start gap-4`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: 'linear-gradient(135deg, #00E5FF15, #00FF8710)', border: '1px solid rgba(0,229,255,0.2)' }}>
                {f.icon}
              </div>
              <div>
                <div className={`font-semibold text-sm mb-1 ${textPrimary}`}>{f.title}</div>
                <div className={`text-xs leading-relaxed ${textSecondary}`}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,255,135,0.06))', border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Ready to analyze your BNPL eligibility?</h3>
            <p className={`text-sm ${textSecondary}`}>Get instant AI-powered risk assessment and personalized recommendations.</p>
          </div>
          <button onClick={onGetStarted} className="btn-primary whitespace-nowrap">
            Analyze Now →
          </button>
        </div>
      </div>
    </div>
  );
}
