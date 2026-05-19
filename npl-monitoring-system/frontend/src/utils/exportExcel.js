import * as XLSX from 'xlsx'
import { formatDate } from './formatCurrency'

export function exportLoansToExcel(loans, filename = 'NPL_Report') {
  const data = loans.map(loan => ({
    'Loan ID':             loan.id,
    'Customer Name':       loan.customerName,
    'Customer ID':         loan.customerId,
    'Loan Type':           loan.loanType,
    'Loan Amount (USD)':   loan.loanAmount,
    'Outstanding (USD)':   loan.outstanding,
    'Days Past Due':       loan.dpd,
    'Classification':      loan.classification,
    'NPL Status':          loan.isNPL ? 'NPL' : 'Performing',
    'Provision (USD)':     Math.round(loan.provision),
    'Interest Rate (%)':   loan.interestRate,
    'Disbursement Date':   formatDate(loan.disbursementDate),
    'Maturity Date':       formatDate(loan.maturityDate),
    'Last Payment Date':   formatDate(loan.lastPaymentDate),
    'Collateral Type':     loan.collateral,
    'Collateral Value':    loan.collateralValue,
    'Branch':              loan.branch,
    'Loan Officer':        loan.officer,
    'Risk Score':          loan.riskScore,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  // Auto-size columns
  ws['!cols'] = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 14),
  }))

  XLSX.utils.book_append_sheet(wb, ws, 'NPL Loans')
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportAlertsToExcel(alerts, filename = 'NPL_Alerts') {
  const data = alerts.map(a => ({
    'Alert ID':    a.id,
    'Type':        a.type,
    'Loan ID':     a.loanId ?? '—',
    'Customer':    a.customerName ?? '—',
    'Priority':    a.priority,
    'Message':     a.message,
    'Created At':  formatDate(a.createdAt),
    'Status':      a.status,
    'Resolved At': a.resolvedAt ? formatDate(a.resolvedAt) : '—',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Alerts')
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportSummaryReport(kpis, loans, filename = 'NPL_Summary') {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    { Metric: 'Total Loans',        Value: kpis.totalLoans },
    { Metric: 'Total Portfolio',    Value: kpis.totalPortfolio },
    { Metric: 'NPL Amount',         Value: kpis.nplAmount },
    { Metric: 'NPL Ratio (%)',      Value: kpis.nplRatio?.toFixed(2) },
    { Metric: 'Coverage Ratio (%)', Value: kpis.coverageRatio?.toFixed(2) },
    { Metric: 'Total Provision',    Value: kpis.totalProvision },
    { Metric: 'NPL Loan Count',     Value: kpis.nplCount },
    { Metric: 'Report Date',        Value: new Date().toLocaleDateString() },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary')

  // NPL loans sheet
  const nplData = loans.filter(l => l.isNPL).map(l => ({
    'Loan ID': l.id, 'Customer': l.customerName, 'Outstanding': l.outstanding,
    'DPD': l.dpd, 'Classification': l.classification, 'Provision': Math.round(l.provision),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nplData), 'NPL Loans')

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
