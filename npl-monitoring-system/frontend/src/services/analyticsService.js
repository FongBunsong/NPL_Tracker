import { isNPL, classifyByDPD } from '../utils/calculateRisk'

// ─── Portfolio breakdown by classification ────────────────────────────────────
export function getPortfolioSummary(loans) {
  const total = loans.reduce((s, l) => s + l.outstanding, 0)
  const byClassification = loans.reduce((acc, l) => {
    const cls = l.classification ?? classifyByDPD(l.dpd)
    if (!acc[cls]) acc[cls] = { count: 0, amount: 0 }
    acc[cls].count++
    acc[cls].amount += l.outstanding
    return acc
  }, {})
  return { total, byClassification }
}

// ─── Branch-level NPL analysis ────────────────────────────────────────────────
export function getBranchPerformance(loans) {
  const map = {}
  loans.forEach(l => {
    if (!map[l.branch]) map[l.branch] = { name: l.branch, total: 0, npl: 0, count: 0, nplCount: 0 }
    map[l.branch].total += l.outstanding
    map[l.branch].count++
    if (l.isNPL) { map[l.branch].npl += l.outstanding; map[l.branch].nplCount++ }
  })
  return Object.values(map)
    .map(b => ({ ...b, nplRatio: b.total > 0 ? (b.npl / b.total) * 100 : 0 }))
    .sort((a, b) => b.nplRatio - a.nplRatio)
}

// ─── Officer-level NPL analysis ───────────────────────────────────────────────
export function getOfficerPerformance(loans) {
  const map = {}
  loans.forEach(l => {
    if (!map[l.officer]) map[l.officer] = { name: l.officer, total: 0, npl: 0, count: 0, nplCount: 0 }
    map[l.officer].total += l.outstanding
    map[l.officer].count++
    if (l.isNPL) { map[l.officer].npl += l.outstanding; map[l.officer].nplCount++ }
  })
  return Object.values(map)
    .map(o => ({ ...o, nplRatio: o.total > 0 ? (o.npl / o.total) * 100 : 0 }))
    .sort((a, b) => b.nplRatio - a.nplRatio)
}

// ─── Loan type breakdown ──────────────────────────────────────────────────────
export function getLoanTypeBreakdown(loans) {
  const map = {}
  loans.forEach(l => {
    if (!map[l.loanType]) map[l.loanType] = { name: l.loanType, total: 0, npl: 0, count: 0 }
    map[l.loanType].total += l.outstanding
    map[l.loanType].count++
    if (l.isNPL) map[l.loanType].npl += l.outstanding
  })
  return Object.values(map)
    .map(t => ({ ...t, nplRatio: t.total > 0 ? (t.npl / t.total) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)
}

// ─── Aging bucket analysis ────────────────────────────────────────────────────
export function getAgingBuckets(loans) {
  const buckets = [
    { bucket: 'Current (0–29d)',     min: 0,   max: 29,  color: '#16a34a', label: 'Pass' },
    { bucket: 'Watch (30–59d)',      min: 30,  max: 59,  color: '#d97706', label: 'Special Mention' },
    { bucket: 'Substandard (60–89d)',min: 60,  max: 89,  color: '#ea580c', label: 'Substandard' },
    { bucket: 'Doubtful (90–179d)',  min: 90,  max: 179, color: '#dc2626', label: 'Doubtful' },
    { bucket: 'Loss (180d+)',        min: 180, max: Infinity, color: '#7f1d1d', label: 'Loss' },
  ]
  return buckets.map(b => ({
    ...b,
    count:  loans.filter(l => l.dpd >= b.min && l.dpd <= b.max).length,
    amount: loans.filter(l => l.dpd >= b.min && l.dpd <= b.max).reduce((s, l) => s + l.outstanding, 0),
  }))
}

// ─── Risk score distribution ─────────────────────────────────────────────────
export function getRiskDistribution(loans) {
  return [
    { label: 'Low (0–30)',    count: loans.filter(l => l.riskScore <= 30).length,                    color: '#16a34a' },
    { label: 'Medium (31–60)',count: loans.filter(l => l.riskScore > 30 && l.riskScore <= 60).length, color: '#d97706' },
    { label: 'High (61–80)', count: loans.filter(l => l.riskScore > 60 && l.riskScore <= 80).length, color: '#ea580c' },
    { label: 'Critical (81+)',count: loans.filter(l => l.riskScore > 80).length,                    color: '#dc2626' },
  ]
}
