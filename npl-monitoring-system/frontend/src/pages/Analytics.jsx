import { useContext } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend,
} from 'recharts'
import { LoanContext } from '../context/LoanContext'
import {
  getBranchPerformance, getOfficerPerformance,
  getLoanTypeBreakdown, getAgingBuckets, getRiskDistribution,
} from '../services/analyticsService'
import Card, { CardHeader } from '../components/ui/Card'
import { formatCurrency, formatPercent } from '../utils/formatCurrency'
import { NPLTrendChart, LoanStatusPieChart } from '../components/dashboard/Charts'
import clsx from 'clsx'

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }} className="flex justify-between gap-3">
          <span className="text-gray-500">{e.name}</span>
          <span className="font-semibold">{typeof e.value === 'number' && e.value > 1000 ? formatCurrency(e.value) : `${Number(e.value).toFixed(1)}${e.name?.includes('%') || e.name === 'NPL %' ? '%' : ''}`}</span>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { loans } = useContext(LoanContext)

  const branchData  = getBranchPerformance(loans)
  const officerData = getOfficerPerformance(loans)
  const typeData    = getLoanTypeBreakdown(loans)
  const riskDist    = getRiskDistribution(loans)
  const aging       = getAgingBuckets(loans)

  return (
    <div className="space-y-6">

      {/* ── Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="NPL Ratio — 7-Month Trend" subtitle="Portfolio-level NPL evolution" />
          <NPLTrendChart />
        </Card>
        <Card>
          <CardHeader title="Loan Classification Split" subtitle="By count" />
          <LoanStatusPieChart />
        </Card>
      </div>

      {/* ── Branch Performance ── */}
      <Card>
        <CardHeader title="Branch NPL Performance" subtitle="NPL ratio and exposure by branch" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Branch', 'Total Loans', 'Total Exposure', 'NPL Count', 'NPL Amount', 'NPL Ratio', 'Health'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branchData.map(b => (
                <tr key={b.name} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.count}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(b.total)}</td>
                  <td className="px-4 py-3 text-gray-500">{b.nplCount}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(b.npl)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full', b.nplRatio > 10 ? 'bg-red-600' : b.nplRatio > 5 ? 'bg-orange-500' : 'bg-green-500')}
                          style={{ width: `${Math.min(b.nplRatio * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{formatPercent(b.nplRatio, 1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', b.nplRatio > 10 ? 'bg-red-100 text-red-700' : b.nplRatio > 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
                      {b.nplRatio > 10 ? 'Critical' : b.nplRatio > 5 ? 'Warning' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Loan Type NPL Breakdown */}
        <Card>
          <CardHeader title="NPL by Loan Type" subtitle="NPL ratio per product" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<TooltipBox />} />
              <Bar dataKey="nplRatio" name="NPL %" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.nplRatio > 10 ? '#dc2626' : entry.nplRatio > 5 ? '#d97706' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Score Distribution */}
        <Card>
          <CardHeader title="Risk Score Distribution" subtitle="Portfolio risk profile" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskDist} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Bar dataKey="count" name="Loans" radius={[5, 5, 0, 0]} maxBarSize={48}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Officer Performance ── */}
      <Card>
        <CardHeader title="Loan Officer Performance" subtitle="NPL ratio by officer" />
        <div className="space-y-3">
          {officerData.map((o, i) => (
            <div key={o.name} className="flex items-center gap-4">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-gray-400')}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{o.name}</span>
                  <span className={clsx('text-xs font-semibold', o.nplRatio > 10 ? 'text-red-600' : o.nplRatio > 5 ? 'text-amber-600' : 'text-green-600')}>
                    {formatPercent(o.nplRatio, 1)} NPL
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', o.nplRatio > 10 ? 'bg-red-500' : o.nplRatio > 5 ? 'bg-amber-500' : 'bg-green-500')}
                      style={{ width: `${Math.min(o.nplRatio * 5, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {o.nplCount}/{o.count} loans · {formatCurrency(o.total, 'USD', true)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
