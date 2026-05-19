import { useContext } from 'react'
import { Download, FileText, FileSpreadsheet, BarChart2, TrendingDown } from 'lucide-react'
import { LoanContext } from '../context/LoanContext'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { exportLoansToExcel, exportAlertsToExcel, exportSummaryReport } from '../utils/exportExcel'
import { formatCurrency, formatPercent, formatDate } from '../utils/formatCurrency'
import { NPLTrendChart, CollectionRateChart } from '../components/dashboard/Charts'
import RiskBadge from '../components/dashboard/RiskBadge'
import clsx from 'clsx'

function ReportCard({ title, description, icon: Icon, iconBg, iconColor, onExport, tag }) {
  return (
    <Card hover className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            {tag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">{tag}</span>}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" icon={Download} onClick={onExport} className="w-full justify-center">
        Download Excel
      </Button>
    </Card>
  )
}

export default function Reports() {
  const { loans, alerts, kpis } = useContext(LoanContext)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const nplLoans = loans.filter(l => l.isNPL)

  return (
    <div className="space-y-6">

      {/* Report date */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FileText size={15} />
        <span>Report as of <strong className="text-gray-700">{today}</strong></span>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Portfolio Executive Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Portfolio', value: formatCurrency(kpis.totalPortfolio, 'USD', true) },
            { label: 'NPL Ratio',       value: formatPercent(kpis.nplRatio, 2), highlight: kpis.nplRatio > 5 },
            { label: 'NPL Amount',      value: formatCurrency(kpis.nplAmount, 'USD', true) },
            { label: 'Coverage Ratio',  value: formatPercent(kpis.coverageRatio, 1) },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={clsx('text-2xl font-extrabold', highlight ? 'text-red-400' : 'text-white')}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export options */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Export Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard
            title="Full Loan Portfolio"
            description="All loans with DPD, classification, provision, risk score, and collateral details."
            icon={FileSpreadsheet}
            iconBg="bg-blue-100" iconColor="text-blue-600"
            tag="All Loans"
            onExport={() => exportLoansToExcel(loans, 'Full_Portfolio')}
          />
          <ReportCard
            title="NPL Loans Report"
            description="Only non-performing loans (60+ DPD) with provision requirements and write-off candidates."
            icon={TrendingDown}
            iconBg="bg-red-100" iconColor="text-red-600"
            tag="NPL Only"
            onExport={() => exportLoansToExcel(nplLoans, 'NPL_Loans')}
          />
          <ReportCard
            title="Alert History"
            description="All generated alerts with status, resolution details, and timeline."
            icon={BarChart2}
            iconBg="bg-amber-100" iconColor="text-amber-600"
            tag="Alerts"
            onExport={() => exportAlertsToExcel(alerts, 'Alert_History')}
          />
          <ReportCard
            title="Executive Summary"
            description="Condensed executive overview with KPIs, NPL loan listing, and portfolio health."
            icon={FileText}
            iconBg="bg-purple-100" iconColor="text-purple-600"
            tag="Summary"
            onExport={() => exportSummaryReport(kpis, loans, 'Executive_Summary')}
          />
        </div>
      </div>

      {/* Charts preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="NPL Ratio Trend" subtitle="7-month overview" />
          <NPLTrendChart />
        </Card>
        <Card>
          <CardHeader title="Monthly Collections" subtitle="Scheduled vs collected" />
          <CollectionRateChart />
        </Card>
      </div>

      {/* Top NPL table */}
      <Card padding={false}>
        <div className="p-5 border-b border-gray-100">
          <CardHeader title="NPL Loan Summary" subtitle={`${nplLoans.length} non-performing loans`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Loan ID', 'Customer', 'Outstanding', 'DPD', 'Classification', 'Provision', 'Maturity'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {nplLoans.sort((a, b) => b.dpd - a.dpd).map(loan => (
                <tr key={loan.id} className="hover:bg-gray-50/50 bg-red-50/20">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{loan.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{loan.customerName}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(loan.outstanding)}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{loan.dpd}d</td>
                  <td className="px-4 py-3"><RiskBadge classification={loan.classification} showDot /></td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(loan.provision)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(loan.maturityDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
