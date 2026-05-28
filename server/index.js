const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'smartbnpl-api' });
});

// EMI calculation using reducing balance method
function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

function calculatePrincipalFromEMI(emi, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round(emi * tenureMonths);
  return Math.round((emi * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)));
}

function getInterestRate(creditScore, employmentType, defaults) {
  let baseRate = 18;
  if (creditScore >= 750) baseRate = 12;
  else if (creditScore >= 700) baseRate = 14;
  else if (creditScore >= 650) baseRate = 16;
  else if (creditScore >= 600) baseRate = 20;
  else baseRate = 24;

  if (employmentType === 'Self-employed') baseRate += 2;
  if (employmentType === 'Student') baseRate += 4;
  if (defaults === 1) baseRate += 3;

  return Math.min(baseRate, 36);
}

function getRiskGrade(affordabilityScore) {
  if (affordabilityScore >= 80) return 'A';
  if (affordabilityScore >= 65) return 'B';
  if (affordabilityScore >= 50) return 'C';
  return 'D';
}

function generateRecommendations(data, emiResult, affordabilityScore) {
  const { monthlyIncome, existingEMI, creditScore, defaults, downPayment, productPrice, tenure } = data;
  const recs = [];
  const emiRatio = (emiResult.monthlyEMI + existingEMI) / monthlyIncome * 100;

  if (emiRatio > 40) recs.push({ type: 'warning', text: `Your EMI consumes ${emiRatio.toFixed(0)}% of income. Consider a longer tenure.` });
  if (emiRatio > 30 && emiRatio <= 40) recs.push({ type: 'info', text: `Your EMI uses ${emiRatio.toFixed(0)}% of monthly income — within safe limits.` });

  const dpPercent = (downPayment / productPrice) * 100;
  if (dpPercent < 20) recs.push({ type: 'warning', text: 'Increase down payment to 20%+ to reduce EMI burden.' });
  if (dpPercent >= 30) recs.push({ type: 'success', text: 'Excellent down payment — this significantly reduces your interest.' });

  if (creditScore < 650) recs.push({ type: 'warning', text: 'Improve your credit score above 650 for better interest rates.' });
  if (creditScore >= 750) recs.push({ type: 'success', text: 'Excellent credit score qualifies you for our best rates.' });

  if (tenure === 3 && affordabilityScore < 70) recs.push({ type: 'info', text: 'A 6-9 month tenure would reduce monthly EMI pressure.' });
  if (tenure >= 9 && affordabilityScore > 80) recs.push({ type: 'success', text: 'You can afford a shorter tenure (6 months) and save on interest.' });

  if (defaults === 0) recs.push({ type: 'success', text: 'Zero defaults — excellent repayment track record.' });
  if (defaults >= 1) recs.push({ type: 'warning', text: 'Past defaults impact your approval odds. Maintain timely payments.' });

  const remaining = monthlyIncome - existingEMI - emiResult.monthlyEMI;
  if (remaining < monthlyIncome * 0.4) recs.push({ type: 'warning', text: `Remaining salary after EMIs: ₹${remaining.toLocaleString('en-IN')} — budget carefully.` });
  if (remaining > monthlyIncome * 0.6) recs.push({ type: 'success', text: `Strong remaining salary: ₹${remaining.toLocaleString('en-IN')} post EMI.` });

  return recs;
}

function analyzeRiskFactors(data, emiResult) {
  const factors = [];
  const { monthlyIncome, existingEMI, creditScore, creditHistory, defaults, employmentType } = data;
  const totalEMIRatio = (emiResult.monthlyEMI + existingEMI) / monthlyIncome;

  factors.push({ positive: true, text: monthlyIncome > 30000 ? 'Stable and sufficient monthly income' : 'Income meets minimum threshold' });
  factors.push({ positive: creditScore >= 650, text: creditScore >= 650 ? `Good credit score (${creditScore})` : `Credit score below safe threshold (${creditScore})` });
  factors.push({ positive: creditHistory >= 12, text: creditHistory >= 12 ? `Established credit history (${creditHistory} months)` : `Short credit history (${creditHistory} months)` });
  factors.push({ positive: defaults === 0, text: defaults === 0 ? 'No payment defaults on record' : `${defaults} default(s) detected — high risk flag` });
  factors.push({ positive: totalEMIRatio <= 0.4, text: totalEMIRatio <= 0.4 ? 'EMI-to-income ratio within safe limit' : `EMI-to-income ratio too high (${(totalEMIRatio * 100).toFixed(0)}%)` });
  factors.push({ positive: employmentType === 'Salaried', text: employmentType === 'Salaried' ? 'Salaried employment — stable income source' : `${employmentType} income — variable risk` });

  return factors;
}

app.post('/analyze', (req, res) => {
  try {
    const { monthlyIncome, existingEMI, creditScore, creditHistory, defaults,
      productPrice, downPayment, tenure, employmentType } = req.body;

    const principal = productPrice - downPayment;
    const annualRate = getInterestRate(creditScore, employmentType, defaults);
    const monthlyEMI = calculateEMI(principal, annualRate, tenure);
    const totalPayable = monthlyEMI * tenure;
    const totalInterest = totalPayable - principal;

    // Affordability score calculation
    let score = 100;
    const totalEMIRatio = (monthlyEMI + existingEMI) / monthlyIncome;
    if (totalEMIRatio > 0.5) score -= 30;
    else if (totalEMIRatio > 0.4) score -= 20;
    else if (totalEMIRatio > 0.3) score -= 10;

    if (creditScore < 550) score -= 25;
    else if (creditScore < 650) score -= 15;
    else if (creditScore >= 750) score += 5;

    if (defaults >= 2) score -= 35;
    else if (defaults === 1) score -= 15;

    if (creditHistory < 6) score -= 10;
    else if (creditHistory >= 24) score += 5;

    const dpPercent = downPayment / productPrice;
    if (dpPercent >= 0.3) score += 5;
    else if (dpPercent < 0.1) score -= 10;

    if (employmentType === 'Student') score -= 10;
    else if (employmentType === 'Self-employed') score -= 5;

    score = Math.max(0, Math.min(100, score));

    // Approval logic
    let hardReject = false;
    let rejectionReasons = [];

    if (defaults >= 2) { hardReject = true; rejectionReasons.push('Multiple defaults detected'); }
    if (totalEMIRatio > 0.5) { hardReject = true; rejectionReasons.push('EMI exceeds 50% of monthly income'); }
    if (creditScore < 500) { hardReject = true; rejectionReasons.push('Credit score critically low'); }
    if (principal <= 0) { hardReject = true; rejectionReasons.push('Down payment exceeds product price'); }

    const riskGrade = getRiskGrade(score);
    const riskLevel = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';
    const remainingSalary = monthlyIncome - existingEMI - monthlyEMI;
    const affordabilityBand = totalEMIRatio <= 0.3 ? 'Safe' : totalEMIRatio <= 0.5 ? 'Moderate' : 'Risky';
    const maxAffordableEMI = Math.max(0, monthlyIncome * 0.3 - existingEMI);
    const eligibleLimit = calculatePrincipalFromEMI(maxAffordableEMI, annualRate, tenure);

    // EMI comparison across tenures
    const emiComparison = [3, 6, 9, 12].map(t => {
      const tenureEMI = calculateEMI(principal, annualRate, t);
      return {
        tenure: t,
        emi: tenureEMI,
        totalInterest: tenureEMI * t - principal,
        totalPayable: tenureEMI * t,
        affordable: (tenureEMI + existingEMI) / monthlyIncome <= 0.3,
      };
    });

    const recommendedTenure = emiComparison.find(row => row.affordable)?.tenure
      || emiComparison.reduce((best, row) => row.emi < best.emi ? row : best, emiComparison[0]).tenure;
    const decisionStatus = hardReject ? 'Rejected' : score >= 70 && totalEMIRatio <= 0.3 ? 'Approved' : score >= 50 ? 'Conditional Approval' : 'Rejected';
    const approved = decisionStatus === 'Approved';
    if (decisionStatus === 'Conditional Approval') {
      rejectionReasons = ['Eligible with safer tenure or higher down payment recommended'];
    } else if (decisionStatus === 'Rejected' && rejectionReasons.length === 0) {
      rejectionReasons = ['Affordability score below approval threshold'];
    }

    const noCostEMI = Math.round(principal / tenure);
    const noCostComparison = [
      { type: 'No Cost EMI', monthlyEMI: noCostEMI, totalPaid: principal, savings: totalPayable - principal },
      { type: 'Standard EMI', monthlyEMI, totalPaid: totalPayable, savings: 0 },
    ];

    const emiResult = { monthlyEMI, totalPayable, totalInterest, annualRate, principal };
    const recommendations = generateRecommendations(req.body, emiResult, score);
    const riskFactors = analyzeRiskFactors(req.body, emiResult);

    res.json({
      approved,
      decisionStatus,
      rejectionReasons,
      affordabilityScore: score,
      riskGrade,
      riskLevel,
      affordabilityBand,
      eligibleLimit,
      recommendedTenure,
      monthlyEMI,
      totalPayable,
      totalInterest,
      annualRate,
      principal,
      remainingSalary,
      recommendations,
      riskFactors,
      emiComparison,
      noCostComparison,
      financialHealth: score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/calculate-emi', (req, res) => {
  const { principal, annualRate, tenure } = req.body;
  const emi = calculateEMI(principal, annualRate, tenure);
  res.json({ emi, totalPayable: emi * tenure, totalInterest: emi * tenure - principal });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`SmartBNPL API running on port ${PORT}`));
