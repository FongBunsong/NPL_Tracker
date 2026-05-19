import { useContext } from 'react'
import {
  TrendingDown, TrendingUp, AlertTriangle, DollarSign,
  Users, ShieldAlert, Activity, BarChart3,
} from 'lucide-react'
import { LoanContext }  from '../context/LoanContext'
import KPICard          from '../components/dashboard/KPIcard'
import AlertPanel       from '../components/dashboard/AlertPanel'
import LoanTable        from '../components/dashboard/LoanTable'
import Card, { CardHeader } from '../components/ui/Card'
import {
  NPLTrendChart, AgingBucketChart,
  LoanStatusPieChart, CollectionRateChart,
} from '../components/dashboard/Charts'
import { formatCurrency, formatPercent } from '../utils/formatCurrency'

export default function Dashboard() {
  const { kpis, loading } = useContext(LoanContext)

  return (
    <div className="space-y-6">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <KPICard
          title="NPL Ratio"
          value={formatPercent(kpis.nplRatio, 1)}
          subtitle={`${kpis.nplCount} of ${kpis.totalLoans} loans are NPL`}
          icon={TrendingDown}
          iconBg="bg-red-100"  iconColor="text-red-600"
          trendValue="+0.3%" trendLabel="vs last month"
          trend="up"  trendGood={false}
          alert={kpis.nplRatio > 5}
        />
        <KPICard
          title="Total Portfolio"
          value={formatCurrency(kpis.totalPortfolio, 'USD', true)}
          subtitle={`${kpis.totalLoans} active loans`}
          icon={DollarSign}
          iconBg="bg-blue-100" iconColor="text-blue-600"
          trendValue="+$45K" trendLabel="vs last month"
          trend="up" trendGood={true}
        />
        <KPICard
          title="NPL Amount"
          value={formatCurrency(kpis.nplAmount, 'USD', true)}
          subtitle="Outstanding in NPL loans"
          icon={ShieldAlert}
          iconBg="bg-orange-100" iconColor="text-orange-600"
          trendValue="+$33.7K" trendLabel="vs last month"
          trend="up" trendGood={false}
          alert={kpis.nplAmount > 300000}
        />
        <KPICard
          title="Coverage Ratio"
          value={formatPercent(kpis.coverageRatio, 1)}
          subtitle={`Provision: ${formatCurrency(kpis.totalProvision, 'USD', true)}`}
          icon={Activity}
          iconBg="bg-purple-100" iconColor="text-purple-600"
          trendValue="-2.1%" trendLabel="vs last month"
          trend="down" trendGood={false}
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Borrowers at Risk"
          value={kpis.borrowersAtRisk}
          subtitle="DPD ≥ 30 days"
          icon={AlertTriangle}
          iconBg="bg-amber-100" iconColor="text-amber-600"
        />
        <KPICard
          title="Watch List"
          value={kpis.watchList}
          subtitle="30–59 DPD (pre-NPL)"
          icon={TrendingUp}
          iconBg="bg-yellow-100" iconColor="text-yellow-600"
        />
        <KPICard
          title="Active Alerts"
          value={kpis.activeAlerts}
          subtitle="Requiring attention"
          icon={AlertTriangle}
          iconBg="bg-red-100" iconColor="text-red-600"
          alert={kpis.activeAlerts > 0}
        />
        <KPICard
          title="Total Borrowers"
          value={kpis.totalLoans}
          subtitle="Across all branches"
          icon={Users}
          iconBg="bg-green-100" iconColor="text-green-600"
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="NPL Ratio Trend"
            subtitle="7-month historical trend"
            action={
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${kpis.nplRatio > 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {kpis.nplRatio > 5 ? '⚠ Above Threshold' : '✓ Within Threshold'}
              </span>
            }
          />
          <NPLTrendChart />
        </Card>

        <Card>
          <CardHeader title="Loan Classification" subtitle="By number of loans" />
          <LoanStatusPieChart />
        </Card>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="DPD Aging Buckets" subtitle="Loan count by days past due" />
          <AgingBucketChart />
        </Card>

        <Card>
          <CardHeader title="Monthly Collections" subtitle="Scheduled vs collected" />
          <CollectionRateChart />
        </Card>
      </div>

      {/* ── Bottom Row: Table + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 border-b border-gray-100">
            <CardHeader
              title="Top NPL Loans"
              subtitle="Highest risk — sorted by DPD"
              action={
                <a href="/loans" className="text-xs font-medium text-blue-600 hover:underline">
                  View all →
                </a>
              }
            />
          </div>
          <div className="p-4">
            <LoanTable maxRows={6} nplOnly />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Active Alerts"
            subtitle={`${kpis.activeAlerts} requiring action`}
          />
          <AlertPanel maxItems={5} />
        </Card>
      </div>

    </div>
  )
}
