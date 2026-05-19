import axios from 'axios'

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// Fetch raw rows from a Google Sheet range
export async function fetchSheetData(sheetId, apiKey, range = 'Loans!A1:Z') {
  const { data } = await axios.get(
    `${BASE}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}?key=${apiKey}`
  )
  return data.values ?? []
}

// Parse raw rows into loan objects (row 1 = headers)
export function parseLoansFromSheet(rows) {
  if (!rows || rows.length < 2) return []
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.slice(1).map((row, i) => {
    const obj = {}
    headers.forEach((h, j) => { obj[h] = row[j] ?? '' })
    return {
      id:               obj.loan_id           || `L-${String(i + 1).padStart(3, '0')}`,
      customerId:       obj.customer_id        || '',
      customerName:     obj.customer_name      || '',
      loanAmount:       parseFloat(obj.loan_amount)         || 0,
      outstanding:      parseFloat(obj.outstanding_balance) || 0,
      dpd:              parseInt(obj.days_past_due)         || 0,
      disbursementDate: obj.disbursement_date  || '',
      maturityDate:     obj.maturity_date      || '',
      interestRate:     parseFloat(obj.interest_rate)       || 0,
      loanType:         obj.loan_type          || 'Term Loan',
      collateral:       obj.collateral_type    || 'None',
      collateralValue:  parseFloat(obj.collateral_value)    || 0,
      branch:           obj.branch             || '',
      officer:          obj.loan_officer       || '',
      lastPaymentDate:  obj.last_payment_date  || '',
      phone:            obj.phone              || '',
      email:            obj.email              || '',
    }
  })
}

// Google Sheets template URL (copy to your Drive)
export const SHEET_TEMPLATE_COLUMNS = [
  'Loan ID', 'Customer ID', 'Customer Name', 'Loan Amount', 'Outstanding Balance',
  'Days Past Due', 'Disbursement Date', 'Maturity Date', 'Interest Rate',
  'Loan Type', 'Collateral Type', 'Collateral Value', 'Branch', 'Loan Officer',
  'Last Payment Date', 'Phone', 'Email',
]
