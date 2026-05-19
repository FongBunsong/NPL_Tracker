const { fetchLoansFromSheets } = require('../services/googleSheetsService')

/** GET /api/loans */
async function getLoans(req, res, next) {
  try {
    const loans = await fetchLoansFromSheets()

    // Optional query filters
    const { classification, branch, isNPL, loanType } = req.query
    let result = loans
    if (classification) result = result.filter(l => l.classification === classification)
    if (branch)         result = result.filter(l => l.branch === branch)
    if (isNPL !== undefined) result = result.filter(l => String(l.isNPL) === isNPL)
    if (loanType)       result = result.filter(l => l.loanType === loanType)

    res.json({ data: result, count: result.length, timestamp: new Date().toISOString() })
  } catch (err) {
    next(err)
  }
}

/** GET /api/loans/:id */
async function getLoanById(req, res, next) {
  try {
    const loans = await fetchLoansFromSheets()
    const loan  = loans.find(l => l.id === req.params.id)
    if (!loan) return res.status(404).json({ error: `Loan ${req.params.id} not found` })
    res.json({ data: loan })
  } catch (err) {
    next(err)
  }
}

module.exports = { getLoans, getLoanById }
