import React, { useState } from 'react';

const N8N_WEBHOOK_URL = 'https://tanyajaiswal1625.app.n8n.cloud/webhook-test/bnpl-check';

const initialForm = {
  fullName: '',
  email: '',
  monthlyIncome: '',
  existingEMI: '',
  creditScore: '',
  creditHistory: '',
  defaults: '',
  productPrice: '',
  downPayment: '',
  tenure: 6,
  employmentType: 'Salaried',
};

function InputField({ label, name, value, onChange, type = 'number', min = 0, max, placeholder, error, darkMode, prefix }) {
  const bg = darkMode
    ? `fintech-input${error ? ' error' : ''}`
    : `fintech-input fintech-input-light${error ? ' error' : ''}`;

  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`${bg} ${prefix ? 'pl-8' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-[#FF3D71] mt-1">{error}</p>}
    </div>
  );
}

export default function InputForm({ darkMode, onAnalysisComplete }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const cardBase = darkMode ? 'glass-card neon-border' : 'bg-white border border-gray-200 shadow-lg rounded-2xl';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';
  const selectBg = darkMode
    ? 'fintech-input'
    : 'fintech-input fintech-input-light';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0) errs.monthlyIncome = 'Enter valid income';
    if (Number(form.existingEMI) < 0) errs.existingEMI = 'Cannot be negative';
    if (!form.creditScore || Number(form.creditScore) < 300 || Number(form.creditScore) > 900) errs.creditScore = 'Credit score: 300–900';
    if (Number(form.creditHistory) < 0) errs.creditHistory = 'Cannot be negative';
    if (Number(form.defaults) < 0) errs.defaults = 'Cannot be negative';
    if (!form.productPrice || Number(form.productPrice) <= 0) errs.productPrice = 'Enter valid price';
    if (Number(form.downPayment) < 0) errs.downPayment = 'Cannot be negative';
    if (Number(form.downPayment) >= Number(form.productPrice)) errs.downPayment = 'Cannot exceed product price';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        monthlyIncome: Number(form.monthlyIncome),
        existingEMI: Number(form.existingEMI) || 0,
        creditScore: Number(form.creditScore),
        creditHistory: Number(form.creditHistory) || 0,
        defaults: Number(form.defaults) || 0,
        productPrice: Number(form.productPrice),
        downPayment: Number(form.downPayment) || 0,
        tenure: Number(form.tenure),
        employmentType: form.employmentType,
      };

      const n8nPayload = {
        name: payload.fullName,
        email: payload.email,
        monthly_income: payload.monthlyIncome,
        credit_history: payload.creditHistory,
        defaults: payload.defaults,
        product_price: payload.productPrice,
        credit_score: payload.creditScore,
        existing_emi: payload.existingEMI,
        down_payment: payload.downPayment,
        tenure: payload.tenure,
        employment_type: payload.employmentType,
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}`);
      }

      const n8nResult = await response.json();
      const result = normalizeN8nResult(n8nResult, payload);
      onAnalysisComplete(result, payload);
    } catch (err) {
      // Fallback: run analysis client-side if backend unreachable
      const payload = {
        monthlyIncome: Number(form.monthlyIncome),
        existingEMI: Number(form.existingEMI) || 0,
        creditScore: Number(form.creditScore),
        creditHistory: Number(form.creditHistory) || 0,
        defaults: Number(form.defaults) || 0,
        productPrice: Number(form.productPrice),
        downPayment: Number(form.downPayment) || 0,
        tenure: Number(form.tenure),
        employmentType: form.employmentType,
        fullName: form.fullName,
        email: form.email,
      };
      const result = runClientAnalysis(payload);
      onAnalysisComplete(result, payload);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(initialForm); setErrors({}); };

  const tenureOptions = [3, 6, 9, 12];
  const emiPreview = form.productPrice && form.downPayment !== ''
    ? Math.round((Number(form.productPrice) - Number(form.downPayment)) * (18 / 12 / 100 + 1) / Number(form.tenure))
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>BNPL Eligibility Analysis</h2>
        <p className={`text-sm ${textSecondary}`}>Fill in your financial profile to get an AI-powered eligibility decision</p>
      </div>

      <div className={`${cardBase} p-6 md:p-8`}>
        {/* Personal Info */}
        <div className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-[#00E5FF]' : 'text-blue-600'}`}>
            ◈ Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange}
              type="text" placeholder="e.g. Arjun Sharma" error={errors.fullName} darkMode={darkMode} />
            <InputField label="Email" name="email" value={form.email} onChange={handleChange}
              type="email" placeholder="arjun@example.com" error={errors.email} darkMode={darkMode} />
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${textSecondary}`}>Employment Type</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className={selectBg}>
                <option value="Salaried">Salaried</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Profile */}
        <div className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-[#00FF87]' : 'text-green-600'}`}>
            ◈ Financial Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Monthly Income" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange}
              placeholder="50000" error={errors.monthlyIncome} darkMode={darkMode} prefix="₹" />
            <InputField label="Existing Monthly EMIs" name="existingEMI" value={form.existingEMI} onChange={handleChange}
              placeholder="5000" error={errors.existingEMI} darkMode={darkMode} prefix="₹" />
            <InputField label="Credit Score" name="creditScore" value={form.creditScore} onChange={handleChange}
              placeholder="720" min={300} max={900} error={errors.creditScore} darkMode={darkMode} />
            <InputField label="Credit History (Months)" name="creditHistory" value={form.creditHistory} onChange={handleChange}
              placeholder="24" error={errors.creditHistory} darkMode={darkMode} />
            <InputField label="Number of Defaults" name="defaults" value={form.defaults} onChange={handleChange}
              placeholder="0" error={errors.defaults} darkMode={darkMode} />
          </div>
        </div>

        {/* Purchase Details */}
        <div className="mb-8">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-[#FFB300]' : 'text-amber-600'}`}>
            ◈ Purchase Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <InputField label="Product Price" name="productPrice" value={form.productPrice} onChange={handleChange}
              placeholder="25000" error={errors.productPrice} darkMode={darkMode} prefix="₹" />
            <InputField label="Down Payment" name="downPayment" value={form.downPayment} onChange={handleChange}
              placeholder="5000" error={errors.downPayment} darkMode={darkMode} prefix="₹" />
          </div>

          {/* Tenure Selector */}
          <div>
            <label className={`block text-xs font-semibold mb-3 ${textSecondary}`}>
              Preferred Tenure: <span className={`font-bold ${darkMode ? 'text-[#00E5FF]' : 'text-blue-600'}`}>{form.tenure} months</span>
            </label>
            <input type="range" name="tenure" min={3} max={12} step={3}
              value={form.tenure}
              onChange={handleChange}
              className="w-full"
              style={{ accentColor: '#00E5FF' }}
            />
            <div className="flex justify-between mt-2">
              {tenureOptions.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tenure: t }))}
                  className={`text-xs px-3 py-1 rounded-full transition-all duration-150
                    ${form.tenure === t
                      ? (darkMode ? 'bg-[#00E5FF20] text-[#00E5FF] border border-[#00E5FF40]' : 'bg-blue-100 text-blue-700 border border-blue-300')
                      : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`}>
                  {t}M
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EMI Preview */}
        {emiPreview && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center justify-between
            ${darkMode ? 'bg-[#00E5FF08] border border-[#00E5FF20]' : 'bg-blue-50 border border-blue-200'}`}>
            <span className={textSecondary}>Estimated monthly EMI preview</span>
            <span className={`font-bold font-mono ${darkMode ? 'text-[#00E5FF]' : 'text-blue-700'}`}>
              ≈ ₹{emiPreview.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></span>
                Analyzing...
              </>
            ) : (
              <>◈ Analyze Eligibility</>
            )}
          </button>
          <button onClick={handleReset} className="btn-danger flex-1">
            ↺ Reset Form
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeN8nResult(n8nResult, payload) {
  const localResult = runClientAnalysis(payload);
  const result = Array.isArray(n8nResult) ? n8nResult[0] : n8nResult;

  if (!result || typeof result !== 'object') {
    return localResult;
  }

  const approvedValue = result.approved ?? result.eligible ?? result.is_eligible ?? result.status;
  const approved = typeof approvedValue === 'boolean'
    ? approvedValue
    : typeof approvedValue === 'string'
      ? ['approved', 'eligible', 'yes', 'true', 'accept', 'accepted'].includes(approvedValue.toLowerCase())
      : localResult.approved;

  const affordabilityScore = Number(result.affordabilityScore ?? result.affordability_score ?? result.score ?? localResult.affordabilityScore);
  const monthlyEMI = Number(result.monthlyEMI ?? result.monthly_emi ?? result.emi ?? localResult.monthlyEMI);
  const annualRate = Number(result.annualRate ?? result.annual_rate ?? result.interest_rate ?? localResult.annualRate);
  const principal = Number(result.principal ?? result.loan_amount ?? localResult.principal);
  const totalPayable = Number(result.totalPayable ?? result.total_payable ?? monthlyEMI * payload.tenure);
  const totalInterest = Number(result.totalInterest ?? result.total_interest ?? totalPayable - principal);
  const remainingSalary = Number(result.remainingSalary ?? result.remaining_salary ?? payload.monthlyIncome - payload.existingEMI - monthlyEMI);
  const riskGrade = result.riskGrade ?? result.risk_grade ?? localResult.riskGrade;
  const riskLevel = result.riskLevel ?? result.risk_level ?? localResult.riskLevel;
  const rejectionReasons = result.rejectionReasons ?? result.rejection_reasons ?? localResult.rejectionReasons;
  const message = result.message ?? result.reason ?? result.recommendation;

  return {
    ...localResult,
    approved,
    affordabilityScore,
    riskGrade,
    riskLevel,
    monthlyEMI,
    totalPayable,
    totalInterest,
    annualRate,
    principal,
    remainingSalary,
    recommendations: Array.isArray(result.recommendations)
      ? result.recommendations
      : message
        ? [{ type: approved ? 'success' : 'warning', text: message }, ...localResult.recommendations]
        : localResult.recommendations,
    riskFactors: Array.isArray(result.riskFactors ?? result.risk_factors)
      ? (result.riskFactors ?? result.risk_factors)
      : localResult.riskFactors,
    emiComparison: Array.isArray(result.emiComparison ?? result.emi_comparison)
      ? (result.emiComparison ?? result.emi_comparison)
      : localResult.emiComparison,
    financialHealth: Number(result.financialHealth ?? result.financial_health ?? affordabilityScore),
    rejectionReasons,
    n8nRaw: result,
  };
}

// Client-side fallback analysis
function runClientAnalysis(data) {
  const { monthlyIncome, existingEMI, creditScore, creditHistory, defaults,
    productPrice, downPayment, tenure, employmentType } = data;

  let baseRate = 18;
  if (creditScore >= 750) baseRate = 12;
  else if (creditScore >= 700) baseRate = 14;
  else if (creditScore >= 650) baseRate = 16;
  else if (creditScore < 600) baseRate = 24;
  if (employmentType === 'Self-employed') baseRate += 2;
  if (employmentType === 'Student') baseRate += 4;

  const principal = productPrice - downPayment;
  const monthlyRate = baseRate / 12 / 100;
  const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1));

  let score = 100;
  const totalEMIRatio = (emi + existingEMI) / monthlyIncome;
  if (totalEMIRatio > 0.5) score -= 30;
  else if (totalEMIRatio > 0.4) score -= 20;
  else if (totalEMIRatio > 0.3) score -= 10;
  if (creditScore < 550) score -= 25;
  else if (creditScore < 650) score -= 15;
  else if (creditScore >= 750) score += 5;
  if (defaults >= 2) score -= 35;
  else if (defaults === 1) score -= 15;
  if (creditHistory < 6) score -= 10;
  score = Math.max(0, Math.min(100, score));

  const approved = defaults < 2 && totalEMIRatio <= 0.5 && creditScore >= 500 && principal > 0;
  const riskGrade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';
  const riskLevel = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';
  const remainingSalary = monthlyIncome - existingEMI - emi;

  const emiComparison = [3, 6, 9, 12].map(t => {
    const e = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1));
    return { tenure: t, emi: e, totalInterest: e * t - principal, totalPayable: e * t };
  });

  return {
    approved, affordabilityScore: score, riskGrade, riskLevel,
    monthlyEMI: emi, totalPayable: emi * tenure, totalInterest: emi * tenure - principal,
    annualRate: baseRate, principal, remainingSalary,
    recommendations: [
      { type: totalEMIRatio > 0.4 ? 'warning' : 'success', text: `EMI-to-income ratio: ${(totalEMIRatio * 100).toFixed(0)}%` },
      { type: creditScore >= 700 ? 'success' : 'warning', text: `Credit score: ${creditScore} — ${creditScore >= 700 ? 'Good standing' : 'Needs improvement'}` },
      { type: defaults === 0 ? 'success' : 'warning', text: defaults === 0 ? 'Zero defaults — excellent track record' : `${defaults} default(s) on record` },
    ],
    riskFactors: [
      { positive: monthlyIncome > 30000, text: monthlyIncome > 30000 ? 'Stable and sufficient monthly income' : 'Low income threshold' },
      { positive: creditScore >= 650, text: creditScore >= 650 ? `Good credit score (${creditScore})` : `Low credit score (${creditScore})` },
      { positive: defaults === 0, text: defaults === 0 ? 'No defaults on record' : `${defaults} default(s) detected` },
      { positive: totalEMIRatio <= 0.4, text: totalEMIRatio <= 0.4 ? 'EMI ratio within safe limits' : 'EMI ratio too high' },
    ],
    emiComparison,
    financialHealth: score,
    rejectionReasons: approved ? [] : ['Eligibility criteria not met'],
  };
}
