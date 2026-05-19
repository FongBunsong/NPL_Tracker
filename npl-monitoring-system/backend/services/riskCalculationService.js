// ── NPL Classification ────────────────────────────────────────────────────────
const CLASSIFICATIONS = {
  PASS:            { label: 'Pass',            minDpd: 0,   maxDpd: 29  },
  SPECIAL_MENTION: { label: 'Special Mention', minDpd: 30,  maxDpd: 59  },
  SUBSTANDARD:     { label: 'Substandard',     minDpd: 60,  maxDpd: 89  },
  DOUBTFUL:        { label: 'Doubtful',        minDpd: 90,  maxDpd: 179 },
  LOSS:            { label: 'Loss',            minDpd: 180, maxDpd: Infinity },
}

const PROVISION_RATES = {
  Pass:            0.01,
  'Special Mention': 0.05,
  Substandard:     0.20,
  Doubtful:        0.50,
  Loss:            1.00,
}

function classifyLoan(dpd) {
  if (dpd >= 180) return 'Loss'
  if (dpd >= 90)  return 'Doubtful'
  if (dpd >= 60)  return 'Substandard'
  if (dpd >= 30)  return 'Special Mention'
  return 'Pass'
}

function calculateProvision(outstanding, classification) {
  const rate = PROVISION_RATES[classification] ?? 0.01
  return Math.round(outstanding * rate * 100) / 100
}

function calculateRiskScore(loan) {
  let score = 0

  // DPD score (40 pts max)
  if (loan.dpd >= 180)     score += 40
  else if (loan.dpd >= 90) score += 30
  else if (loan.dpd >= 60) score += 22
  else if (loan.dpd >= 30) score += 12
  else                     score += 0

  // LTV score (20 pts max)
  const ltv = loan.collateralValue > 0 ? (loan.outstanding / loan.collateralValue) * 100 : 100
  if (ltv >= 90)      score += 20
  else if (ltv >= 70) score += 14
  else if (ltv >= 50) score += 8
  else                score += 3

  // Exposure score (20 pts max)
  if (loan.outstanding >= 200000)     score += 20
  else if (loan.outstanding >= 50000) score += 14
  else if (loan.outstanding >= 10000) score += 8
  else                                score += 3

  // Loan type score (10 pts max)
  const highRiskTypes = ['unsecured', 'consumer', 'personal']
  const loanTypeLower = (loan.loanType || '').toLowerCase()
  score += highRiskTypes.some(t => loanTypeLower.includes(t)) ? 10 : 3

  // Interest rate score (10 pts max)
  const rate = loan.interestRate || 0
  if (rate >= 25)     score += 10
  else if (rate >= 18)score += 7
  else if (rate >= 12)score += 4
  else                score += 1

  return Math.min(100, score)
}

module.exports = { classifyLoan, calculateProvision, calculateRiskScore }
