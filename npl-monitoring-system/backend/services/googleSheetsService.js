const { getSheetsClient } = require('../config/googleSheetsConfig')
const { classifyLoan, calculateProvision, calculateRiskScore } = require('./riskCalculationService')

const SHEET_ID   = process.env.GOOGLE_SHEET_ID
const RANGE      = 'Sheet1!A1:S1000'

const COLUMN_MAP = {
  'Loan ID':              'id',
  'Customer ID':          'customerId',
  'Customer Name':        'customerName',
  'Loan Amount':          'loanAmount',
  'Outstanding Balance':  'outstanding',
  'Days Past Due':        'dpd',
  'Disbursement Date':    'disbursementDate',
  'Maturity Date':        'maturityDate',
  'Interest Rate':        'interestRate',
  'Loan Type':            'loanType',
  'Collateral Type':      'collateralType',
  'Collateral Value':     'collateralValue',
  'Branch':               'branch',
  'Loan Officer':         'loanOfficer',
  'Last Payment Date':    'lastPaymentDate',
  'Phone':                'phone',
  'Email':                'email',
}

/**
 * Fetch and parse loans from Google Sheets.
 * Throws if the sheet ID is not configured.
 * @returns {Promise<object[]>} Enriched loan objects
 */
async function fetchLoansFromSheets() {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set in environment variables')

  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  })

  const rows = response.data.values
  if (!rows || rows.length < 2) return []

  const headers = rows[0].map(h => h.trim())
  const dataRows = rows.slice(1)

  const loans = dataRows
    .filter(row => row.some(cell => cell?.trim()))
    .map(row => {
      const loan = {}
      headers.forEach((header, i) => {
        const fieldName = COLUMN_MAP[header]
        if (fieldName) loan[fieldName] = row[i] ?? ''
      })

      // Type coercions
      loan.loanAmount     = parseFloat(loan.loanAmount)     || 0
      loan.outstanding    = parseFloat(loan.outstanding)    || 0
      loan.dpd            = parseInt(loan.dpd, 10)          || 0
      loan.interestRate   = parseFloat(loan.interestRate)   || 0
      loan.collateralValue= parseFloat(loan.collateralValue)|| 0

      // Computed fields
      loan.classification = classifyLoan(loan.dpd)
      loan.provision      = calculateProvision(loan.outstanding, loan.classification)
      loan.riskScore      = calculateRiskScore(loan)
      loan.isNPL          = loan.dpd >= 60
      loan.status         = loan.dpd === 0 ? 'current' : loan.dpd < 30 ? 'overdue' : 'delinquent'

      return loan
    })
    .filter(l => l.id)

  return loans
}

module.exports = { fetchLoansFromSheets }
