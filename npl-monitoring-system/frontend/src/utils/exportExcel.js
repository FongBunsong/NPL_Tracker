import ExcelJS from 'exceljs'
import { formatDate } from './formatCurrency'

function datedFilename(filename) {
  return `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
}

function downloadWorkbook(workbook, filename) {
  return workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob(
      [buffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = datedFilename(filename)
    link.click()
    URL.revokeObjectURL(url)
  })
}

function addSheetFromJson(workbook, sheetName, data, minWidth = 14) {
  const ws = workbook.addWorksheet(sheetName)
  const headers = Object.keys(data[0] || {})

  ws.columns = headers.map(header => ({
    header,
    key: header,
    width: Math.max(header.length + 2, minWidth),
  }))

  data.forEach(row => ws.addRow(row))
  ws.getRow(1).font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

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

  const wb = new ExcelJS.Workbook()
  addSheetFromJson(wb, 'NPL Loans', data, 14)
  return downloadWorkbook(wb, filename)
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

  const wb = new ExcelJS.Workbook()
  addSheetFromJson(wb, 'Alerts', data, 18)
  return downloadWorkbook(wb, filename)
}

export function exportSummaryReport(kpis, loans, filename = 'NPL_Summary') {
  const wb = new ExcelJS.Workbook()

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
  addSheetFromJson(wb, 'Summary', summaryData, 18)

  // NPL loans sheet
  const nplData = loans.filter(l => l.isNPL).map(l => ({
    'Loan ID': l.id, 'Customer': l.customerName, 'Outstanding': l.outstanding,
    'DPD': l.dpd, 'Classification': l.classification, 'Provision': Math.round(l.provision),
  }))
  addSheetFromJson(wb, 'NPL Loans', nplData, 14)

  return downloadWorkbook(wb, filename)
}
