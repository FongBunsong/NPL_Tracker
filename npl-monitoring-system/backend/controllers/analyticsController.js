const { fetchLoansFromSheets } = require('../services/googleSheetsService')

/** GET /api/analytics/kpis */
async function getKpis(req, res, next) {
  try {
    const loans        = await fetchLoansFromSheets()
    const totalPortfolio = loans.reduce((s, l) => s + l.outstanding, 0)
    const nplLoans     = loans.filter(l => l.isNPL)
    const nplAmount    = nplLoans.reduce((s, l) => s + l.outstanding, 0)
    const totalProv    = loans.reduce((s, l) => s + l.provision, 0)

    res.json({
      data: {
        totalLoans:     loans.length,
        totalPortfolio,
        nplCount:       nplLoans.length,
        nplAmount,
        nplRatio:       totalPortfolio > 0 ? (nplAmount / totalPortfolio) * 100 : 0,
        totalProvision: totalProv,
        coverageRatio:  nplAmount > 0 ? (totalProv / nplAmount) * 100 : 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
}

/** GET /api/analytics/branches */
async function getBranches(req, res, next) {
  try {
    const loans = await fetchLoansFromSheets()
    const map   = {}
    for (const l of loans) {
      if (!map[l.branch]) map[l.branch] = { name: l.branch, count: 0, total: 0, nplCount: 0, npl: 0 }
      map[l.branch].count++
      map[l.branch].total += l.outstanding
      if (l.isNPL) { map[l.branch].nplCount++; map[l.branch].npl += l.outstanding }
    }
    const data = Object.values(map).map(b => ({
      ...b,
      nplRatio: b.total > 0 ? (b.npl / b.total) * 100 : 0,
    }))
    res.json({ data, timestamp: new Date().toISOString() })
  } catch (err) {
    next(err)
  }
}

module.exports = { getKpis, getBranches }
