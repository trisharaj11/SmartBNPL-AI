import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, CheckCircle2, Gauge, IndianRupee, Lightbulb, Percent, ShieldCheck, SlidersHorizontal, Sparkles, Timer, TrendingDown, TrendingUp } from 'lucide-react';

function calcEMI(principal, annualRate, tenure) {
  if (principal <= 0) return 0;
  const r = annualRate / 12 / 100;
  return Math.round((principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
}

function getRateForScore(creditScore) {
  if (creditScore >= 750) return 12;
  if (creditScore >= 700) return 14;
  if (creditScore >= 650) return 16;
  if (creditScore < 600) return 24;
  return 18;
}

function evaluateScenario({ productPrice, downPayment, tenure, creditScore, monthlyIncome, existingEMI }) {
  const rate = getRateForScore(creditScore);
  const principal = Math.max(0, productPrice - downPayment);
  const emi = calcEMI(principal, rate, tenure);
  const totalEMIRatio = monthlyIncome > 0 ? (emi + existingEMI) / monthlyIncome : 1;
  const remaining = monthlyIncome - existingEMI - emi;

  let score = 100;
  if (totalEMIRatio > 0.5) score -= 30;
  else if (totalEMIRatio > 0.4) score -= 20;
  else if (totalEMIRatio > 0.3) score -= 10;
  if (creditScore < 550) score -= 25;
  else if (creditScore < 650) score -= 15;
  else if (creditScore >= 750) score += 5;
  score = Math.max(0, Math.min(100, score));

  return {
    emi,
    totalEMIRatio,
    remaining,
    score,
    approved: totalEMIRatio <= 0.5 && creditScore >= 500 && principal > 0,
    rate,
    principal,
    total: emi * tenure,
  };
}

function clampDownPayment(value, productPrice) {
  const maxDownPayment = Math.floor(productPrice * 0.8);
  return Math.min(Math.max(0, Math.round(value / 500) * 500), maxDownPayment);
}

function SliderRow({ label, value, min, max, step, onChange, format, darkMode, color = '#38BDF8' }) {
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
  const currentInputs = { productPrice, downPayment, tenure, creditScore, monthlyIncome, existingEMI };

  useEffect(() => {
    setDownPayment(prev => clampDownPayment(prev, productPrice));
  }, [productPrice]);

  const scenarioPresets = [
    {
      label: 'Safer',
      tone: '#22C55E',
      description: 'Higher down payment and longer tenure',
      apply: () => {
        setDownPayment(clampDownPayment(productPrice * 0.35, productPrice));
        setTenure(12);
      },
    },
    {
      label: 'Balanced',
      tone: '#38BDF8',
      description: 'Moderate upfront cash with 6 month tenure',
      apply: () => {
        setDownPayment(clampDownPayment(productPrice * 0.2, productPrice));
        setTenure(6);
      },
    },
    {
      label: 'Stretched',
      tone: '#F59E0B',
      description: 'Lower down payment and faster payoff',
      apply: () => {
        setDownPayment(clampDownPayment(productPrice * 0.1, productPrice));
        setTenure(3);
      },
    },
  ];

  const analyze = useCallback(() => {
    const scenario = evaluateScenario({ productPrice, downPayment, tenure, creditScore, monthlyIncome, existingEMI });

    setResult({ ...scenario, totalEMIRatio: (scenario.totalEMIRatio * 100).toFixed(1) });
  }, [productPrice, downPayment, tenure, creditScore, monthlyIncome, existingEMI]);

  useEffect(() => { analyze(); }, [analyze]);

  // Sensitivity data: EMI across down payment variations
  const sensitivityData = Array.from({ length: 6 }, (_, i) => {
    const dp = Math.round((productPrice * (i * 0.1)) / 1000) * 1000;
    const scenario = evaluateScenario({ productPrice, downPayment: dp, tenure, creditScore, monthlyIncome, existingEMI });
    return { dp: `${i * 10}%`, emi: scenario.emi };
  });

  const approvalColor = result?.approved ? '#22C55E' : '#EF4444';
  const scoreColor = result?.score >= 75 ? '#22C55E' : result?.score >= 50 ? '#F59E0B' : '#EF4444';
  const tenureData = [3, 6, 9, 12].map(months => {
    const scenario = evaluateScenario({ productPrice, downPayment, tenure: months, creditScore, monthlyIncome, existingEMI });
    return {
      tenure: `${months}M`,
      months,
      emi: scenario.emi,
      total: scenario.total,
      interest: Math.max(0, scenario.total - scenario.principal),
      ratio: Number((scenario.totalEMIRatio * 100).toFixed(1)),
      approved: scenario.approved,
    };
  });
  const safeTenures = tenureData.filter(item => item.approved);
  const bestTenure = safeTenures.length
    ? [...safeTenures].sort((a, b) => a.total - b.total)[0]
    : null;
  const approvalDp = (() => {
    if (result?.approved) return downPayment;
    const maxDp = Math.floor(productPrice * 0.8);
    for (let dp = Math.max(0, downPayment); dp <= maxDp; dp += 500) {
      const scenario = evaluateScenario({ productPrice, downPayment: dp, tenure, creditScore, monthlyIncome, existingEMI });
      if (scenario.approved) return dp;
    }
    return null;
  })();
  const currentMonthlyCommitment = (result?.emi || 0) + existingEMI;
  const incomeGap = Math.max(0, Math.ceil(currentMonthlyCommitment / 0.5 - monthlyIncome));
  const approvalCushion = Math.max(0, Math.floor(monthlyIncome * 0.5 - currentMonthlyCommitment));
  const scoreGap = Math.max(0, 500 - creditScore);
  const leverCards = [
    {
      label: result?.approved ? 'Approval Cushion' : 'Down Payment Path',
      value: result?.approved
        ? `${fmt(approvalCushion)} spare`
        : approvalDp !== null
          ? `${fmt(approvalDp)} total`
          : 'Not enough',
      sub: result?.approved
        ? 'Before the 50% EMI/income ceiling'
        : approvalDp !== null
          ? `Add ${fmt(Math.max(0, approvalDp - downPayment))} to clear the ratio test`
          : 'Try a lower cart value or higher monthly income',
      color: result?.approved ? '#22C55E' : approvalDp !== null ? '#38BDF8' : '#EF4444',
      icon: ShieldCheck,
    },
    {
      label: incomeGap > 0 ? 'Income Gap' : 'Income Buffer',
      value: incomeGap > 0 ? `${fmt(incomeGap)}/mo` : `${fmt(approvalCushion)}/mo`,
      sub: incomeGap > 0 ? 'Extra monthly income needed for approval' : 'Room left under the approval threshold',
      color: incomeGap > 0 ? '#F59E0B' : '#22C55E',
      icon: TrendingUp,
    },
    {
      label: 'Best Safe Tenure',
      value: bestTenure ? `${bestTenure.months} months` : 'No safe tenure',
      sub: bestTenure ? `${fmt(bestTenure.emi)} EMI with lowest safe total` : scoreGap > 0 ? `Credit score needs +${scoreGap}` : 'Increase down payment or reduce the cart',
      color: bestTenure ? '#8B5CF6' : '#EF4444',
      icon: Timer,
    },
  ];
  const comparisonScenarios = [
    { name: 'Current', inputs: currentInputs },
    {
      name: 'Safer',
      inputs: {
        ...currentInputs,
        downPayment: clampDownPayment(productPrice * 0.35, productPrice),
        tenure: 12,
      },
    },
    {
      name: 'Lean',
      inputs: {
        ...currentInputs,
        downPayment: clampDownPayment(productPrice * 0.1, productPrice),
        tenure: 3,
      },
    },
  ].map((item) => {
    const scenario = evaluateScenario(item.inputs);
    return {
      ...item,
      emi: scenario.emi,
      ratio: Number((scenario.totalEMIRatio * 100).toFixed(1)),
      total: scenario.total,
      score: scenario.score,
      approved: scenario.approved,
    };
  });
  const stressData = [0, 10, 20, 30].map((drop) => {
    const stressedIncome = Math.max(1, Math.round(monthlyIncome * (1 - drop / 100)));
    const scenario = evaluateScenario({ ...currentInputs, monthlyIncome: stressedIncome });
    return {
      drop: drop === 0 ? 'Base' : `-${drop}%`,
      income: stressedIncome,
      ratio: Number((scenario.totalEMIRatio * 100).toFixed(1)),
      remaining: scenario.remaining,
      score: scenario.score,
      approved: scenario.approved,
    };
  });
  const firstStressFailure = stressData.find(item => !item.approved);
  const stressVerdict = firstStressFailure
    ? firstStressFailure.drop === 'Base'
      ? 'Risky at current income'
      : `Breaks at ${firstStressFailure.drop} income`
    : 'Holds through -30% income';
  const stressColor = firstStressFailure ? '#F59E0B' : '#22C55E';

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
            onChange={(v) => setDownPayment(clampDownPayment(v, productPrice))} format={fmt} darkMode={darkMode} color="#22C55E" />

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

      {/* Scenario presets */}
      <div className={`${cardBase} p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className={`flex items-center gap-2 text-sm font-semibold mb-1 ${textPrimary}`}>
              <Sparkles size={16} style={{ color: '#38BDF8' }} />
              Quick Scenario Presets
            </h3>
            <p className={`text-xs ${textSecondary}`}>Apply common repayment strategies, then fine tune with the sliders.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[560px]">
            {scenarioPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={preset.apply}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${darkMode ? 'bg-[#0A0F1E] border-white/10 hover:border-sky-400/40' : 'bg-gray-50 border-slate-200 hover:border-sky-300'}`}
              >
                <div className="text-sm font-bold mb-1" style={{ color: preset.tone }}>{preset.label}</div>
                <div className={`text-[11px] leading-relaxed ${textSecondary}`}>{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision levers */}
      <div className={`${cardBase} p-6`}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>Decision Levers</h3>
            <p className={`text-xs ${textSecondary}`}>Smallest practical changes that move this scenario toward a safer approval.</p>
          </div>
          <div className={`hidden sm:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <CheckCircle2 size={14} style={{ color: approvalColor }} />
            50% EMI ratio limit
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leverCards.map((card) => (
            <div key={card.label} className={`p-4 rounded-lg border ${darkMode ? 'bg-[#0A0F1E] border-white/10' : 'bg-gray-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>{card.label}</span>
                <card.icon size={17} style={{ color: card.color }} />
              </div>
              <div className="text-xl font-bold font-mono mb-1" style={{ color: card.color }}>{card.value}</div>
              <div className={`text-xs leading-relaxed ${textSecondary}`}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario comparison */}
      <div className={`${cardBase} p-6`}>
        <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>Scenario Comparison</h3>
        <p className={`text-xs mb-4 ${textSecondary}`}>Current inputs compared against safer and lean repayment structures.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonScenarios.map((scenario) => (
            <div key={scenario.name} className={`p-4 rounded-lg border ${darkMode ? 'bg-[#0A0F1E] border-white/10' : 'bg-gray-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>{scenario.name}</span>
                <span className="text-[11px] font-mono px-2 py-1 rounded-full"
                  style={{
                    color: scenario.approved ? '#22C55E' : '#EF4444',
                    background: scenario.approved ? '#22C55E18' : '#EF444418',
                    border: `1px solid ${scenario.approved ? '#22C55E35' : '#EF444435'}`,
                  }}>
                  {scenario.approved ? 'APPROVED' : 'WATCH'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={`text-[11px] mb-1 ${textSecondary}`}>EMI</div>
                  <div className="text-base font-bold font-mono" style={{ color: '#38BDF8' }}>{fmt(scenario.emi)}</div>
                </div>
                <div>
                  <div className={`text-[11px] mb-1 ${textSecondary}`}>Ratio</div>
                  <div className="text-base font-bold font-mono" style={{ color: scenario.ratio <= 50 ? '#22C55E' : '#EF4444' }}>{scenario.ratio}%</div>
                </div>
                <div>
                  <div className={`text-[11px] mb-1 ${textSecondary}`}>Total</div>
                  <div className="text-base font-bold font-mono" style={{ color: '#F59E0B' }}>{fmt(scenario.total)}</div>
                </div>
                <div>
                  <div className={`text-[11px] mb-1 ${textSecondary}`}>Score</div>
                  <div className="text-base font-bold font-mono" style={{ color: scenario.score >= 75 ? '#22C55E' : scenario.score >= 50 ? '#F59E0B' : '#EF4444' }}>{scenario.score}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress test */}
      <div className={`${cardBase} p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className={`flex items-center gap-2 text-sm font-semibold mb-1 ${textPrimary}`}>
              <TrendingDown size={16} style={{ color: stressColor }} />
              Income Stress Test
            </h3>
            <p className={`text-xs ${textSecondary}`}>Checks whether the current EMI remains safe if monthly income temporarily falls.</p>
          </div>
          <div className={`px-4 py-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-[11px] uppercase tracking-wider mb-1 ${textSecondary}`}>Resilience verdict</div>
            <div className="text-sm font-bold" style={{ color: stressColor }}>{stressVerdict}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stressData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="drop" tick={{ fill: chartText, fontSize: 12 }} />
              <YAxis tick={{ fill: chartText, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" />
              <Tooltip formatter={(v, name) => [name === 'ratio' ? `${v}%` : v, name === 'ratio' ? 'EMI/Income Ratio' : name]}
                contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
              <Line type="monotone" dataKey="ratio" stroke="#38BDF8" strokeWidth={2.5} dot={{ fill: '#38BDF8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {stressData.map((item) => (
              <div key={item.drop} className={`p-3 rounded-lg border ${darkMode ? 'bg-[#0A0F1E] border-white/10' : 'bg-gray-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${textSecondary}`}>{item.drop}</span>
                  <span className="text-[10px] font-mono" style={{ color: item.approved ? '#22C55E' : '#EF4444' }}>
                    {item.approved ? 'SAFE' : 'RISK'}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono" style={{ color: item.ratio <= 50 ? '#22C55E' : '#EF4444' }}>{item.ratio}%</div>
                <div className={`text-[11px] mt-1 ${textSecondary}`}>{fmt(item.income)} income</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensitivity chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBase} p-6`}>
          <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>EMI Sensitivity to Down Payment</h3>
          <p className={`text-xs mb-4 ${textSecondary}`}>How monthly EMI changes with different down payment percentages</p>
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

        <div className={`${cardBase} p-6`}>
          <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`}>Tenure Trade-Off</h3>
          <p className={`text-xs mb-4 ${textSecondary}`}>Compare EMI load across repayment tenures; red bars miss the approval threshold.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="tenure" tick={{ fill: chartText, fontSize: 12 }} />
              <YAxis tick={{ fill: chartText, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" />
              <Tooltip formatter={(v, name) => [name === 'ratio' ? `${v}%` : `₹${v.toLocaleString('en-IN')}`, name === 'ratio' ? 'EMI/Income Ratio' : name]}
                contentStyle={{ background: chartBg, border: `1px solid ${gridColor}`, borderRadius: '8px', color: chartText }} />
              <Bar dataKey="ratio" radius={[6, 6, 0, 0]}>
                {tenureData.map((entry) => (
                  <Cell key={entry.tenure} fill={entry.approved ? '#22C55E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
