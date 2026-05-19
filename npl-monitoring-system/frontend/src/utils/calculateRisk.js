import { PROVISION_RATES } from './constants'

// ─── DPD Classification ──────────────────────────────────────────────────────
export function classifyByDPD(dpd) {
  if (dpd < 30)  return 'Pass'
  if (dpd < 60)  return 'Special Mention'
  if (dpd < 90)  return 'Substandard'
  if (dpd < 180) return 'Doubtful'
  return 'Loss'
}

export function isNPL(dpd) {
  return dpd >= 60
}

// ─── Provision Calculation ───────────────────────────────────────────────────
export function getProvisionRate(classification) {
  return PROVISION_RATES[classification] ?? 0
}

export function calculateProvision(outstandingBalance, classification) {
  return outstandingBalance * getProvisionRate(classification)
}

// ─── Composite Risk Score (0–100) ────────────────────────────────────────────
export function calculateRiskScore(loan) {
  let score = 0

  // DPD component (max 40 pts)
  if      (loan.dpd >= 180) score += 40
  else if (loan.dpd >= 90)  score += 30
  else if (loan.dpd >= 60)  score += 22
  else if (loan.dpd >= 30)  score += 12

  // LTV ratio component (max 20 pts)
  const ltv = loan.collateralValue > 0 ? (loan.outstanding / loan.collateralValue) * 100 : 120
  if      (ltv > 100) score += 20
  else if (ltv > 80)  score += 14
  else if (ltv > 60)  score += 9
  else if (ltv > 40)  score += 5

  // Exposure size component (max 20 pts)
  if      (loan.outstanding > 1_000_000) score += 20
  else if (loan.outstanding > 500_000)   score += 15
  else if (loan.outstanding > 100_000)   score += 10
  else if (loan.outstanding > 50_000)    score += 6
  else                                   score += 2

  // Loan type inherent risk (max 10 pts)
  const loanTypeRisk = {
    Microfinance: 9, 'SME Loan': 6, Overdraft: 6,
    'Term Loan': 4, 'Revolving Credit': 5, Mortgage: 2,
  }
  score += loanTypeRisk[loan.loanType] ?? 5

  // Interest rate risk (max 10 pts)
  if      (loan.interestRate > 24) score += 10
  else if (loan.interestRate > 18) score += 7
  else if (loan.interestRate > 12) score += 4
  else                             score += 2

  return Math.min(score, 100)
}

// ─── Portfolio Metrics ────────────────────────────────────────────────────────
export function calculateNPLRatio(loans) {
  const total = loans.reduce((s, l) => s + l.outstanding, 0)
  const npl   = loans.filter(l => isNPL(l.dpd)).reduce((s, l) => s + l.outstanding, 0)
  return total > 0 ? (npl / total) * 100 : 0
}

export function calculateCoverageRatio(loans) {
  const nplAmount      = loans.filter(l => isNPL(l.dpd)).reduce((s, l) => s + l.outstanding, 0)
  const totalProvision = loans.reduce((s, l) => s + (l.provision ?? 0), 0)
  return nplAmount > 0 ? (totalProvision / nplAmount) * 100 : 0
}

export function getDPDDistribution(loans) {
  return {
    '0-29':    loans.filter(l => l.dpd < 30).length,
    '30-59':   loans.filter(l => l.dpd >= 30 && l.dpd < 60).length,
    '60-89':   loans.filter(l => l.dpd >= 60 && l.dpd < 90).length,
    '90-179':  loans.filter(l => l.dpd >= 90 && l.dpd < 180).length,
    '180+':    loans.filter(l => l.dpd >= 180).length,
  }
}
