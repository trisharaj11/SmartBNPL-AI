import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Gauge, IndianRupee, Lightbulb, Percent, SlidersHorizontal } from 'lucide-react';

function calcEMI(principal, annualRate, tenure) {
  if (principal <= 0) return 0;
  const r = annualRate / 12 / 100;
  return Math.round((principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
}

function SliderRow({ label, value, min, max, step, onChange, format, darkMode, color = '#38BDF8' }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <label className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</label>
        <span className="text-sm font-bold font-mono" style={{ color }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: color }} />
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>{format(min)}</span>
        <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>{format(max)}</span>
      </div>
    </div>
  );
}

export default function WhatIfSimulator({ darkMode, initialData }) {
  const [productPrice, setProductPrice] = useState(initialData?.productPrice || 25000);
  const [downPayment, setDownPayment] = useState(initialData?.downPayment || 5000);
  const [tenure, setTenure] = useState(initialData?.tenure || 6);
  const [creditScore, setCreditScore] = useState(initialData?.creditScore || 720);
  const [monthlyIncome, setMonthlyIncome] = useState(initialData?.monthlyIncome || 50000);
  const [existingEMI, setExistingEMI] = useState(initialData?.existingEMI || 0);
  const [result, setResult] = useState(null);

  const cardBase = 'premium-panel';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';
  const chartBg = darkMode ? '#0F1629' : '#F8FAFF';
  const gridColor = darkMode ? '#1E2D4D' : '#E5E7EB';
  const chartText = darkMode ? '#94A3B8' : '#6B7280';

  const fmt = (v) => `₹${v.toLocaleString('en-IN')}`;

  const analyze = useCallback(() => {
    let rate = 18;
    if (creditScore >= 750) rate = 12;
    else if (creditScore >= 700) rate = 14;
    else if (creditScore >= 650) rate = 16;
    else if (creditScore < 600) rate = 24;

    const principal = Math.max(0, productPrice - downPayment);
    const emi = calcEMI(principal, rate, tenure);
    const totalEMIRatio = (emi + existingEMI) / monthlyIncome;
    const remaining = monthlyIncome - existingEMI - emi;

    let score = 100;
    if (totalEMIRatio > 0.5) score -= 30;
    else if (totalEMIRatio > 0.4) score -= 20;
    else if (totalEMIRatio > 0.3) score -= 10;
    if (creditScore < 550) score -= 25;
    else if (creditScore < 650) score -= 15;
    else if (creditScore >= 750) score += 5;
    score = Math.max(0, Math.min(100, score));

    const approved = totalEMIRatio <= 0.5 && creditScore >= 500 && principal > 0;

    setResult({ emi, totalEMIRatio: (totalEMIRatio * 100).toFixed(1), remaining, score, approved, rate, principal, total: emi * tenure });
  }, [productPrice, downPayment, tenure, creditScore, monthlyIncome, existingEMI]);

  useEffect(() => { analyze(); }, [analyze]);

  // Sensitivity data: EMI across down payment variations
  const sensitivityData = Array.from({ length: 6 }, (_, i) => {
    const dp = Math.round((productPrice * (i * 0.1)) / 1000) * 1000;
    const p = Math.max(0, productPrice - dp);
    const rate = creditScore >= 750 ? 12 : creditScore >= 700 ? 14 : creditScore >= 650 ? 16 : 24;
    const e = calcEMI(p, rate, tenure);
    return { dp: `${i * 10}%`, emi: e };
  });

  const approvalColor = result?.approved ? '#22C55E' : '#EF4444';
  const scoreColor = result?.score >= 75 ? '#22C55E' : result?.score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className={`section-kicker mb-3 ${darkMode ? 'bg-white/5 text-sky-300 border border-white/10' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
            <SlidersHorizontal size={13} />
            Scenario studio
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${textPrimary}`}>What-If Simulator</h2>
          <p className={`text-sm ${textSecondary}`}>Adjust parameters in real time to compare repayment safety across BNPL scenarios.</p>
        </div>
        <div className={`px-4 py-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`text-[11px] uppercase tracking-wider mb-1 ${textSecondary}`}>Live affordability score</div>
          <div className="text-2xl font-bold font-mono" style={{ color: scoreColor }}>{result?.score || 0}/100</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className={`${cardBase} p-6`}>
          <h3 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-5 ${darkMode ? 'text-[#38BDF8]' : 'text-blue-600'}`}>
            <SlidersHorizontal size={14} />
            Adjust Parameters
          </h3>

          <SliderRow label="Product Price" value={productPrice}
            min={1000} max={200000} step={1000}
            onChange={setProductPrice} format={fmt} darkMode={darkMode} color="#38BDF8" />

          <SliderRow label="Down Payment" value={downPayment}
            min={0} max={Math.floor(productPrice * 0.8)} step={500}
            onChange={(v) => setDownPayment(Math.min(v, productPrice - 1))} format={fmt} darkMode={darkMode} color="#22C55E" />

          <SliderRow label="Repayment Tenure" value={tenure}
            min={3} max={12} step={3}
            onChange={setTenure} format={(v) => `${v} months`} darkMode={darkMode} color="#8B5CF6" />

          <SliderRow label="Monthly Income" value={monthlyIncome}
            min={10000} max={300000} step={1000}
            onChange={setMonthlyIncome} format={fmt} darkMode={darkMode} color="#F59E0B" />

          <SliderRow label="Credit Score" value={creditScore}
            min={300} max={900} step={10}
            onChange={setCreditScore} format={(v) => v} darkMode={darkMode} color="#EF4444" />

          <SliderRow label="Existing Monthly EMIs" value={existingEMI}
            min={0} max={50000} step={500}
            onChange={setExistingEMI} format={fmt} darkMode={darkMode} color="#38BDF8" />
        </div>

        {/* Live Result */}
        <div className="space-y-4">
          {/* Approval status */}
          <div className={`${cardBase} p-6`}
            style={{ borderColor: result ? `${approvalColor}40` : undefined }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Live Decision</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: approvalColor }}></span>
                <span className="text-xs font-mono" style={{ color: approvalColor }}>
                  {result?.approved ? 'APPROVED' : 'REJECTED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Monthly EMI', value: fmt(result?.emi || 0), color: '#38BDF8', icon: IndianRupee },
                { label: 'EMI/Income Ratio', value: `${result?.totalEMIRatio}%`, color: parseFloat(result?.totalEMIRatio) > 40 ? '#EF4444' : '#22C55E', icon: Percent },
                { label: 'Remaining Salary', value: fmt(result?.remaining || 0), color: (result?.remaining || 0) > 0 ? '#22C55E' : '#EF4444', icon: Activity },
                { label: 'Affordability Score', value: result?.score || 0, color: scoreColor, icon: Gauge },
              ].map((item, i) => (
                <div key={i} className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-[#0A0F1E]' : 'bg-gray-50'}`}>
                  <div className={`flex items-center gap-2 text-xs mb-1 ${textSecondary}`}>
                    <item.icon size={13} />
                    {item.label}
                  </div>
                  <div className="text-lg font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interest rate badge */}
          <div className={`${cardBase} p-4 flex items-center justify-between`}>
            <div>
              <div className={`text-xs ${textSecondary} mb-1`}>Applied Interest Rate</div>
              <div className="text-xl font-bold font-mono" style={{ color: '#8B5CF6' }}>{result?.rate}% p.a.</div>
            </div>
            <div>
              <div className={`text-xs ${textSecondary} mb-1`}>Total Payable</div>
              <div className="text-xl font-bold font-mono" style={{ color: '#F59E0B' }}>{fmt(result?.total || 0)}</div>
            </div>
            <div>
              <div className={`text-xs ${textSecondary} mb-1`}>Principal</div>
              <div className="text-xl font-bold font-mono" style={{ color: '#38BDF8' }}>{fmt(result?.principal || 0)}</div>
            </div>
          </div>

          {/* Tip */}
          <div className={`px-4 py-3 rounded-lg text-xs flex items-start gap-2 ${darkMode ? 'bg-[#38BDF808] border border-[#38BDF820] text-slate-300' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            <Lightbulb size={15} className="mt-0.5 flex-shrink-0" />
            <span>
              <strong>Planning insight:</strong> Increasing down payment to{' '}
              <strong>{Math.round((downPayment / productPrice) * 100 + 10)}%</strong> of product price
              would reduce your EMI by approximately{' '}
              <strong>₹{Math.round((result?.emi || 0) * 0.1).toLocaleString('en-IN')}</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Sensitivity chart */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>EMI Sensitivity to Down Payment</h3>
        <p className={`text-xs mb-4 ${textSecondary}`}>How your monthly EMI changes with different down payment percentages</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={sensitivityData}>
            <defs>
              <linearGradient id="emiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="dp" tick={{ fill: chartText, fontSize: 12 }} />
            <YAxis tick={{ fill: chartText, fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Monthly EMI']}
              contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
            <Area type="monotone" dataKey="emi" stroke="#38BDF8" fill="url(#emiGrad)" strokeWidth={2} dot={{ fill: '#38BDF8' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
