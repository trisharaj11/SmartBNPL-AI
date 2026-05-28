import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

function ScoreRing({ score, darkMode }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let s = 0;
    const interval = setInterval(() => {
      s += 2;
      if (s >= score) { setAnimatedScore(score); clearInterval(interval); }
      else setAnimatedScore(s);
    }, 16);
    return () => clearInterval(interval);
  }, [score]);

  const color = score >= 75 ? '#00FF87' : score >= 50 ? '#FFB300' : '#FF3D71';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (animatedScore / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1E2D4D" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: 'stroke-dasharray 0.1s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{animatedScore}</span>
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>/ 100</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, darkMode }) {
  const bg = darkMode ? 'glass-card neon-border card-lift' : 'bg-white border border-gray-200 shadow-md rounded-2xl card-lift';
  return (
    <div className={`${bg} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-xl font-bold font-mono mb-1" style={{ color }}>{value}</div>
      {sub && <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{sub}</div>}
    </div>
  );
}

function RiskBar({ label, value, max = 100, color, darkMode }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth((value / max) * 100), 200); }, [value, max]);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="risk-meter-track">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${color}44` }} />
      </div>
    </div>
  );
}

const TENURE_COLORS = ['#00E5FF', '#00FF87', '#FFB300', '#9B59B6'];

export default function ResultDashboard({ result, formData, darkMode, onNewAnalysis }) {
  const cardBase = darkMode ? 'glass-card neon-border' : 'bg-white border border-gray-200 shadow-lg rounded-2xl';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';

  const {
    approved = false, decisionStatus, affordabilityScore = 0, riskGrade = '-', riskLevel = 'High', affordabilityBand,
    eligibleLimit = 0, recommendedTenure, monthlyEMI = 0,
    totalPayable = 0, totalInterest = 0, annualRate = 0, principal = 0, remainingSalary = 0,
    recommendations = [], riskFactors = [], emiComparison = [], noCostComparison = [], financialHealth,
    rejectionReasons = []
  } = result || {};

  const animatedEMI = useAnimatedCounter(monthlyEMI, 1000);
  const animatedScore = useAnimatedCounter(affordabilityScore, 1200);
  const animatedRemaining = useAnimatedCounter(remainingSalary, 1000);

  const chartBg = darkMode ? '#0F1629' : '#F8FAFF';
  const chartText = darkMode ? '#94A3B8' : '#6B7280';
  const gridColor = darkMode ? '#1E2D4D' : '#E5E7EB';

  const gradeColor = { A: '#00FF87', B: '#00E5FF', C: '#FFB300', D: '#FF3D71' }[riskGrade] || '#94A3B8';
  const displayDecision = decisionStatus || (approved ? 'Approved' : 'Rejected');
  const approvalColor = displayDecision === 'Approved' ? '#00FF87'
    : displayDecision === 'Conditional Approval' ? '#FFB300'
      : '#FF3D71';

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`${cardBase} p-8 md:p-10 text-center`}>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)' }}>
            ◉
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Dashboard</h2>
          <p className={`text-sm mb-6 ${textSecondary}`}>
            Run an eligibility check to see affordability score, repayment charts, risk factors, and recommendations here.
          </p>
          <button onClick={onNewAnalysis} className="btn-primary py-2.5 px-5 text-sm">
            ◈ Start Eligibility Check
          </button>
        </div>
      </div>
    );
  }

  // Pie chart data
  const salaryData = [
    { name: 'New EMI', value: monthlyEMI },
    { name: 'Existing EMIs', value: formData?.existingEMI || 0 },
    { name: 'Remaining Salary', value: Math.max(0, remainingSalary) },
  ];
  const PIE_COLORS = ['#00E5FF', '#9B59B6', '#00FF87'];

  // Monthly repayment trend
  const repaymentTrend = emiComparison?.map(item => ({
    tenure: `${item.tenure}M`,
    EMI: item.emi,
    Interest: item.totalInterest,
    Total: item.totalPayable,
  }));

  // Print handler
  const handlePrint = () => window.print();

  const handleDownload = () => {
    const content = `
SMARTBNPL AI - ELIGIBILITY REPORT
===================================
Date: ${new Date().toLocaleDateString('en-IN')}
Name: ${formData?.fullName || 'N/A'}

DECISION: ${displayDecision.toUpperCase()}
Risk Grade: ${riskGrade}
Affordability Score: ${affordabilityScore}/100
Risk Level: ${riskLevel}
Affordability Band: ${affordabilityBand || 'N/A'}

FINANCIAL SUMMARY
-----------------
Eligible Limit: ₹${eligibleLimit?.toLocaleString('en-IN')}
Recommended Tenure: ${recommendedTenure || formData?.tenure || '-'} months
Monthly EMI: ₹${monthlyEMI?.toLocaleString('en-IN')}
Principal Amount: ₹${principal?.toLocaleString('en-IN')}
Total Interest: ₹${totalInterest?.toLocaleString('en-IN')}
Total Payable: ₹${totalPayable?.toLocaleString('en-IN')}
Annual Interest Rate: ${annualRate}%
Remaining Salary: ₹${remainingSalary?.toLocaleString('en-IN')}

RECOMMENDATIONS
---------------
${recommendations?.map(r => `• ${r.text}`).join('\n')}

RISK FACTORS
------------
${riskFactors?.map(f => `${f.positive ? '✔' : '⚠'} ${f.text}`).join('\n')}

===================================
Generated by SmartBNPL AI Platform
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartBNPL_Report_${formData?.fullName || 'Report'}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>
            Analysis Result — <span className="font-mono">{formData?.fullName || 'User'}</span>
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <button onClick={onNewAnalysis} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
            ${darkMode ? 'border-[#1E2D4D] text-slate-300 hover:border-[#00E5FF30] hover:text-[#00E5FF]' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            + New Analysis
          </button>
          <button onClick={handleDownload} className="btn-primary py-2 px-4 text-sm">
            ↓ Download Report
          </button>
          <button onClick={handlePrint} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
            ${darkMode ? 'border-[#1E2D4D] text-slate-300 hover:border-[#FFB30040] hover:text-[#FFB300]' : 'border-gray-200 text-gray-600'}`}>
            🖨 Print
          </button>
        </div>
      </div>

      {/* Approval Banner */}
      <div className={`rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4`}
        style={{ background: `${approvalColor}10`, border: `1px solid ${approvalColor}30` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${approvalColor}15`, border: `1px solid ${approvalColor}30` }}>
            {displayDecision === 'Approved' ? '✓' : displayDecision === 'Conditional Approval' ? '!' : '✗'}
          </div>
          <div>
            <div className={`text-xl font-bold`} style={{ color: approvalColor }}>
              {displayDecision.toUpperCase()}
            </div>
            <div className={`text-sm ${textSecondary}`}>
              {displayDecision === 'Approved'
                ? 'You qualify for BNPL financing'
                : rejectionReasons?.join(', ') || 'Eligibility criteria not met'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs mb-1" style={{ color: gradeColor }}>Risk Grade</div>
            <div className="text-3xl font-bold font-mono" style={{ color: gradeColor }}>{riskGrade}</div>
          </div>
          <div className="text-center">
            <div className={`text-xs mb-1 ${textSecondary}`}>Risk Level</div>
            <div className={`text-sm font-semibold px-3 py-1 rounded-full`}
              style={{ background: `${riskLevel === 'Low' ? '#00FF87' : riskLevel === 'Medium' ? '#FFB300' : '#FF3D71'}15`,
                color: riskLevel === 'Low' ? '#00FF87' : riskLevel === 'Medium' ? '#FFB300' : '#FF3D71',
                border: `1px solid ${riskLevel === 'Low' ? '#00FF87' : riskLevel === 'Medium' ? '#FFB300' : '#FF3D71'}30` }}>
              {riskLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly EMI" value={`₹${animatedEMI.toLocaleString('en-IN')}`}
          sub={`${result.tenure || formData?.tenure || '-'} months`} color="#00E5FF" icon="◈" darkMode={darkMode} />
        <StatCard label="Eligible Limit" value={`₹${Number(eligibleLimit || 0).toLocaleString('en-IN')}`}
          sub="safe principal estimate" color="#00FF87" icon="₹" darkMode={darkMode} />
        <StatCard label="Affordability" value={`${animatedScore}`}
          sub="out of 100" color={affordabilityScore >= 75 ? '#00FF87' : affordabilityScore >= 50 ? '#FFB300' : '#FF3D71'} icon="⬡" darkMode={darkMode} />
        <StatCard label="Recommended" value={`${recommendedTenure || formData?.tenure || '-'}M`}
          sub="safest tenure" color="#00E5FF" icon="⟁" darkMode={darkMode} />
        <StatCard label="Interest Rate" value={`${annualRate}%`}
          sub="per annum" color="#9B59B6" icon="%" darkMode={darkMode} />
        <StatCard label="Total Payable" value={`₹${(totalPayable / 1000).toFixed(1)}K`}
          sub={`+ ₹${(totalInterest / 1000).toFixed(1)}K interest`} color="#FFB300" icon="₹" darkMode={darkMode} />
        <StatCard label="Remaining" value={`₹${animatedRemaining.toLocaleString('en-IN')}`}
          sub="post-EMI salary" color={remainingSalary > 0 ? '#00FF87' : '#FF3D71'} icon="◉" darkMode={darkMode} />
        <StatCard label="Risk Grade" value={riskGrade}
          sub={`${affordabilityBand || riskLevel} risk`} color={gradeColor} icon="⟁" darkMode={darkMode} />
      </div>

      {/* Score + Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score ring */}
        <div className={`${cardBase} p-6 flex flex-col items-center justify-center`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Affordability Score</h3>
          <ScoreRing score={affordabilityScore} darkMode={darkMode} />
          <div className="mt-4 text-center">
            <div className={`text-sm font-semibold ${textPrimary}`}>
              {affordabilityScore >= 80 ? 'Excellent' : affordabilityScore >= 65 ? 'Good' : affordabilityScore >= 50 ? 'Fair' : 'Poor'}
            </div>
            <div className={`text-xs mt-1 ${textSecondary}`}>Financial Readiness</div>
          </div>
        </div>

        {/* Pie chart */}
        <div className={`${cardBase} p-6`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Salary Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={salaryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {salaryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {salaryData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }}></div>
                <span className={`text-xs ${textSecondary}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk bars */}
        <div className={`${cardBase} p-6`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Financial Health</h3>
          <RiskBar label="Affordability Score" value={affordabilityScore}
            color={affordabilityScore >= 75 ? '#00FF87' : affordabilityScore >= 50 ? '#FFB300' : '#FF3D71'} darkMode={darkMode} />
          <RiskBar label="Income Utilization"
            value={Math.min(100, Math.round(((monthlyEMI + (formData?.existingEMI || 0)) / formData?.monthlyIncome) * 100))}
            color={((monthlyEMI + (formData?.existingEMI || 0)) / formData?.monthlyIncome) < 0.4 ? '#00FF87' : '#FF3D71'} darkMode={darkMode} />
          <RiskBar label="Credit Health"
            value={Math.min(100, Math.round(((formData?.creditScore || 0) - 300) / 6))}
            color={formData?.creditScore >= 700 ? '#00FF87' : formData?.creditScore >= 600 ? '#FFB300' : '#FF3D71'} darkMode={darkMode} />
          <RiskBar label="Down Payment Ratio"
            value={Math.round((formData?.downPayment / formData?.productPrice) * 100)}
            color="#00E5FF" darkMode={darkMode} />
        </div>
      </div>

      {/* EMI Comparison Bar Chart */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>EMI Comparison Across Tenures</h3>
        <p className={`text-xs mb-4 ${textSecondary}`}>Monthly EMI vs Total Interest for different repayment periods</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={repaymentTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="tenure" tick={{ fill: chartText, fontSize: 12 }} />
            <YAxis tick={{ fill: chartText, fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: chartText }} />
            <Bar dataKey="EMI" name="Monthly EMI" fill="#00E5FF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Interest" name="Total Interest" fill="#FF3D71" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Repayment trend line */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>Cumulative Repayment Trend</h3>
        <p className={`text-xs mb-4 ${textSecondary}`}>Total amount payable per tenure option</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={repaymentTrend}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="tenure" tick={{ fill: chartText, fontSize: 12 }} />
            <YAxis tick={{ fill: chartText, fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
            <Area type="monotone" dataKey="Total" name="Total Payable" stroke="#00E5FF" fill="url(#totalGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="EMI" name="Monthly EMI" stroke="#00FF87" strokeWidth={2} dot={{ fill: '#00FF87' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* No Cost vs Standard EMI */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>No Cost EMI vs Standard EMI</h3>
        <p className={`text-xs mb-4 ${textSecondary}`}>Quick comparison of interest-free and standard BNPL repayment</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(noCostComparison || []).map((row, i) => (
            <div key={row.type || i} className={`p-4 rounded-xl border ${darkMode ? 'bg-[#0A0F1E] border-[#1E2D4D]' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-semibold ${textPrimary}`}>{row.type}</span>
                {row.savings > 0 && <span className="text-xs font-semibold text-[#00FF87]">Saves ₹{row.savings.toLocaleString('en-IN')}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={`text-xs mb-1 ${textSecondary}`}>Monthly EMI</div>
                  <div className="font-mono font-bold" style={{ color: row.type === 'No Cost EMI' ? '#00FF87' : '#00E5FF' }}>
                    ₹{row.monthlyEMI?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className={`text-xs mb-1 ${textSecondary}`}>Total Paid</div>
                  <div className={`font-mono font-bold ${textPrimary}`}>₹{row.totalPaid?.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk factors + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <div className={`${cardBase} p-6`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>◉ Risk Factor Analysis</h3>
          <div className="space-y-3">
            {riskFactors?.map((factor, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl
                ${factor.positive
                  ? (darkMode ? 'bg-[#00FF8708] border border-[#00FF8720]' : 'bg-green-50 border border-green-100')
                  : (darkMode ? 'bg-[#FF3D7108] border border-[#FF3D7120]' : 'bg-red-50 border border-red-100')}`}>
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: factor.positive ? '#00FF87' : '#FF3D71' }}>
                  {factor.positive ? '✔' : '⚠'}
                </span>
                <span className={`text-xs leading-relaxed ${textSecondary}`}>{factor.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className={`${cardBase} p-6`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>⟁ Smart Recommendations</h3>
          <div className="space-y-3">
            {recommendations?.map((rec, i) => {
              const color = rec.type === 'success' ? '#00FF87' : rec.type === 'warning' ? '#FFB300' : '#00E5FF';
              const bg = rec.type === 'success' ? '#00FF8708' : rec.type === 'warning' ? '#FFB30008' : '#00E5FF08';
              const border = rec.type === 'success' ? '#00FF8720' : rec.type === 'warning' ? '#FFB30020' : '#00E5FF20';
              return (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <span className="text-sm flex-shrink-0 mt-0.5" style={{ color }}>
                    {rec.type === 'success' ? '✔' : rec.type === 'warning' ? '⚠' : 'ℹ'}
                  </span>
                  <span className={`text-xs leading-relaxed ${textSecondary}`}>{rec.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EMI Schedule Table */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>◈ EMI Schedule Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs ${textSecondary} border-b ${darkMode ? 'border-[#1E2D4D]' : 'border-gray-200'}`}>
                <th className="pb-3 text-left font-semibold">Tenure</th>
                <th className="pb-3 text-right font-semibold">Monthly EMI</th>
                <th className="pb-3 text-right font-semibold">Total Interest</th>
                <th className="pb-3 text-right font-semibold">Total Payable</th>
                <th className="pb-3 text-right font-semibold">Affordable?</th>
                <th className="pb-3 text-right font-semibold">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {emiComparison?.map((row, i) => {
                const isCurrent = row.tenure === (formData?.tenure);
                return (
                  <tr key={i} className={`border-b transition-colors
                    ${darkMode ? 'border-[#1E2D4D] hover:bg-[#0F1629]' : 'border-gray-100 hover:bg-gray-50'}
                    ${isCurrent ? (darkMode ? 'bg-[#00E5FF08]' : 'bg-blue-50') : ''}`}>
                    <td className="py-3">
                      <span className={`font-mono font-semibold ${isCurrent ? (darkMode ? 'text-[#00E5FF]' : 'text-blue-600') : textPrimary}`}>
                        {row.tenure} months
                      </span>
                    </td>
                    <td className={`py-3 text-right font-mono ${textPrimary}`}>₹{row.emi?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono text-[#FF3D71]">₹{row.totalInterest?.toLocaleString('en-IN')}</td>
                    <td className={`py-3 text-right font-mono ${textPrimary}`}>₹{row.totalPayable?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.affordable ? 'bg-[#00FF8720] text-[#00FF87]' : 'bg-[#FF3D7120] text-[#FF3D71]'}`}>
                        {row.affordable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {isCurrent && <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-[#00E5FF20] text-[#00E5FF]' : 'bg-blue-100 text-blue-700'}`}>Selected</span>}
                      {row.tenure === recommendedTenure && !isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-[#00FF8720] text-[#00FF87]">Optimal</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
