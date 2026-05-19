import { classifyByDPD, calculateRiskScore, calculateProvision, isNPL } from '../utils/calculateRisk'
import { ALERT_TYPES, NPL_RATIO_ALERT_THRESHOLD } from '../utils/constants'

// ─── Re-classify entire portfolio ────────────────────────────────────────────
export function runRiskEngine(loans) {
  return loans.map(loan => {
    const classification = classifyByDPD(loan.dpd)
    const provision      = calculateProvision(loan.outstanding, classification)
    const riskScore      = calculateRiskScore(loan)
    const npl            = isNPL(loan.dpd)

    const flags = []
    if (loan.dpd >= 30  && loan.dpd < 60)  flags.push('WATCH')
    if (loan.dpd >= 60)                    flags.push('NPL')
    if (loan.dpd >= 90)                    flags.push('REQUIRES_PROVISION')
    if (loan.dpd >= 180)                   flags.push('WRITE_OFF_CANDIDATE')
    const ltv = loan.collateralValue > 0 ? (loan.outstanding / loan.collateralValue) * 100 : 100
    if (ltv > 100)                         flags.push('UNDERCOLLATERALIZED')

    return { ...loan, classification, provision, riskScore, isNPL: npl, flags }
  })
}

// ─── Auto-generate alerts from portfolio state ────────────────────────────────
export function generateAlerts(loans, existingAlertLoanIds = []) {
  const newAlerts = []
  const totalPortfolio = loans.reduce((s, l) => s + l.outstanding, 0)
  const nplAmount      = loans.filter(l => l.isNPL).reduce((s, l) => s + l.outstanding, 0)
  const nplRatio       = totalPortfolio > 0 ? (nplAmount / totalPortfolio) * 100 : 0

  if (nplRatio > NPL_RATIO_ALERT_THRESHOLD) {
    newAlerts.push({
      id:          `A-AUTO-RATIO-${Date.now()}`,
      type:        ALERT_TYPES.NPL_RATIO_HIGH.id,
      priority:    'critical',
      message:     `Portfolio NPL Ratio is ${nplRatio.toFixed(2)}% — exceeds ${NPL_RATIO_ALERT_THRESHOLD}% threshold`,
      createdAt:   new Date().toISOString(),
      status:      'active',
      loanId:      null,
      customerName:null,
      amount:      null,
    })
  }

  loans.forEach(loan => {
    if (existingAlertLoanIds.includes(loan.id)) return

    const base = {
      loanId:      loan.id,
      customerId:  loan.customerId,
      customerName:loan.customerName,
      createdAt:   new Date().toISOString(),
      status:      'active',
      amount:      loan.outstanding,
    }

    if (loan.dpd >= 180) {
      newAlerts.push({ ...base, id: `A-AUTO-${loan.id}-180`, type: 'DPD_180', priority: 'critical',
        message: `${loan.customerName} (${loan.id}) at ${loan.dpd} DPD — Loss. Write-off candidate.` })
    } else if (loan.dpd >= 90) {
      newAlerts.push({ ...base, id: `A-AUTO-${loan.id}-90`, type: 'DPD_90', priority: 'critical',
        message: `${loan.customerName} (${loan.id}) at ${loan.dpd} DPD — Doubtful. Provision: $${Math.round(loan.provision).toLocaleString()}` })
    } else if (loan.dpd >= 60) {
      newAlerts.push({ ...base, id: `A-AUTO-${loan.id}-60`, type: 'DPD_60', priority: 'high',
        message: `${loan.customerName} (${loan.id}) passed 60 DPD — now NPL (Substandard).` })
    } else if (loan.dpd >= 30) {
      newAlerts.push({ ...base, id: `A-AUTO-${loan.id}-30`, type: 'DPD_30', priority: 'medium',
        message: `${loan.customerName} (${loan.id}) at ${loan.dpd} DPD — Special Mention. Follow up required.` })
    }
  })

  return newAlerts
}
