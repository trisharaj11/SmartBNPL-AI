import React from 'react';
import { ArrowRight, BarChart3, Calculator, Gauge, ShieldCheck, Workflow } from 'lucide-react';

const stats = [
  { label: 'Decision Rules', value: '14+', color: '#22C55E' },
  { label: 'Decision Time', value: '<2s', color: '#38BDF8' },
  { label: 'Risk Grades', value: 'A-D', color: '#8B5CF6' },
  { label: 'Tenures Compared', value: '4', color: '#F59E0B' },
];

const features = [
  { icon: ShieldCheck, title: 'Eligibility Engine', desc: 'Approval, conditional approval, and rejection logic with clear reason codes.' },
  { icon: Calculator, title: 'EMI Intelligence', desc: 'Reducing-balance EMI math with interest and tenure tradeoffs.' },
  { icon: BarChart3, title: 'Affordability Dashboard', desc: 'Eligible limit, risk grade, repayment load, and salary allocation in one view.' },
  { icon: Workflow, title: 'n8n Automation Layer', desc: 'Webhook-driven workflow for processing, storage, and notifications.' },
];

function DataCard({ className, title, value, accent, bars }) {
  return (
    <div className={`hero-data-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wider text-slate-400">{title}</span>
        <span className="text-sm font-bold font-mono" style={{ color: accent }}>{value}</span>
      </div>
      <div className="sparkline" style={{ '--bar-color': accent }}>
        {bars.map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}
      </div>
    </div>
  );
}

export default function LandingHero({ darkMode, onGetStarted, onOpenSimulator }) {
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-950';
  const metricCard = darkMode ? 'premium-panel' : 'premium-panel';

  return (
    <div className="space-y-12">
      <section className="hero-command -mx-1 md:-mx-4">
        <div className="hero-data-layer" aria-hidden="true">
          <DataCard className="one" title="Risk Score" value="A" accent="#22C55E" bars={[38, 52, 46, 72, 88, 64, 78]} />
          <DataCard className="two" title="EMI Load" value="23%" accent="#38BDF8" bars={[72, 60, 54, 46, 38, 34, 28]} />
          <DataCard className="three" title="Tenure Fit" value="6M" accent="#F59E0B" bars={[32, 44, 62, 76, 58, 48, 36]} />
          <DataCard className="four" title="Limit" value="₹57.6K" accent="#8B5CF6" bars={[24, 36, 42, 58, 68, 78, 86]} />
        </div>

        <div className="hero-copy">
          <div className={`section-kicker mb-6 ${darkMode ? 'bg-white/5 text-sky-300 border border-white/10' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            BNPL affordability command center
          </div>

          <h1 className={`text-4xl md:text-6xl font-bold leading-tight mb-5 ${textPrimary}`}>
            Smart BNPL decisions users can trust
          </h1>

          <p className={`text-base md:text-lg max-w-3xl mx-auto mb-9 leading-relaxed ${textSecondary}`}>
            Evaluate repayment safety, eligible limit, risk grade, EMI burden, and recommended tenure through one polished financial decision-support workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGetStarted} className="btn-primary flex items-center gap-2">
              Start Eligibility Check
              <ArrowRight size={16} />
            </button>
            <button onClick={onOpenSimulator} className="btn-secondary flex items-center gap-2">
              Open Simulator
              <Gauge size={16} />
            </button>
          </div>
        </div>
      </section>

      <div className="metric-strip">
        {stats.map((s) => (
          <div key={s.label} className={`${metricCard} p-5`}>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className={`text-xs ${textSecondary}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className={`section-kicker mb-3 ${darkMode ? 'bg-white/5 text-slate-300 border border-white/10' : 'bg-white text-slate-600 border border-slate-200'}`}>
              <BarChart3 size={13} />
              Core workflow
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Built for explainable affordability</h2>
          </div>
          <button onClick={onGetStarted} className="hidden sm:inline-flex btn-secondary items-center gap-2 py-2.5 px-4 text-sm">
            Analyze Profile
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="premium-panel p-6 flex items-start gap-4 card-lift">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: darkMode ? 'rgba(56,189,248,0.09)' : '#EFF6FF', border: '1px solid rgba(56,189,248,0.2)' }}>
                <feature.icon size={19} color={darkMode ? '#38BDF8' : '#0369A1'} />
              </div>
              <div>
                <div className={`font-semibold text-sm mb-1 ${textPrimary}`}>{feature.title}</div>
                <div className={`text-xs leading-relaxed ${textSecondary}`}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
