import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useContext } from 'react'
import { LoanContext } from '../../context/LoanContext'
import { MOCK_MONTHLY_TREND, MOCK_COLLECTIONS } from '../../data/mockData'
import { getAgingBuckets } from '../../services/analyticsService'
import { formatCurrency } from '../../utils/formatCurrency'

// ─── Shared custom tooltip ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs min-w-[130px]">
      <p className="font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex justify-between gap-4" style={{ color: entry.color }}>
          <span className="text-gray-500">{entry.name}</span>
          <span className="font-semibold">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

// ─── 1. NPL Ratio Trend ───────────────────────────────────────────────────────
export function NPLTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={MOCK_MONTHLY_TREND} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="nplGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <Tooltip content={<ChartTooltip formatter={v => `${v}%`} />} />
        {/* 5% threshold line — reference */}
        <Area
          type="monotone" dataKey="nplRatio" name="NPL Ratio"
          stroke="#ef4444" strokeWidth={2.5}
          fill="url(#nplGrad)"
          dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── 2. DPD Aging Bucket Bar Chart ───────────────────────────────────────────
export function AgingBucketChart() {
  const { loans } = useContext(LoanContext)
  const data      = getAgingBuckets(loans)

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="bucket" tick={{ fontSize: 9.5, fill: '#94a3b8' }}
          axisLine={false} tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip formatter={v => `${v} loans`} />} />
        <Bar dataKey="count" name="Loans" radius={[5, 5, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── 3. Loan Classification Donut Chart ──────────────────────────────────────
const CLASSIFICATIONS = [
  { label: 'Pass',            color: '#16a34a' },
  { label: 'Special Mention', color: '#d97706' },
  { label: 'Substandard',     color: '#ea580c' },
  { label: 'Doubtful',        color: '#dc2626' },
  { label: 'Loss',            color: '#7f1d1d' },
]

export function LoanStatusPieChart() {
  const { loans } = useContext(LoanContext)
  const data = CLASSIFICATIONS.map(c => ({
    name:  c.label,
    value: loans.filter(l => l.classification === c.label).length,
    color: c.color,
  })).filter(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={58} outerRadius={88}
          paddingAngle={3} dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          content={<ChartTooltip formatter={(v, name) => `${v} loans`} />}
        />
        <Legend
          formatter={v => (
            <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── 4. Monthly Collection Rate ───────────────────────────────────────────────
export function CollectionRateChart() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={MOCK_COLLECTIONS} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<ChartTooltip formatter={v => formatCurrency(v)} />} />
        <Legend formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
        <Bar dataKey="scheduled" name="Scheduled" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="collected" name="Collected"  fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
