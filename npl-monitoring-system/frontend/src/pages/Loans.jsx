import { useState } from 'react'
import { Search, Filter, Download, X, SlidersHorizontal } from 'lucide-react'
import { useLoans }     from '../hooks/useLoans'
import RiskBadge, { NPLBadge } from '../components/dashboard/RiskBadge'
import Card, { CardHeader }    from '../components/ui/Card'
import Button                  from '../components/ui/Button'
import Modal                   from '../components/ui/Modal'
import { Select }              from '../components/ui/Input'
import { TableSkeleton }       from '../components/ui/Loader'
import { formatCurrency, formatDate, formatPercent } from '../utils/formatCurrency'
import { exportLoansToExcel }  from '../utils/exportExcel'
import { BRANCHES, LOAN_TYPES } from '../utils/constants'
import clsx from 'clsx'

const CLASSIFICATIONS = ['Pass', 'Special Mention', 'Substandard', 'Doubtful', 'Loss']

function DetailModal({ loan, onClose }) {
  if (!loan) return null
  const rows = [
    ['Loan ID',           loan.id],
    ['Customer Name',     loan.customerName],
    ['Customer ID',       loan.customerId],
    ['Phone',             loan.phone],
    ['Email',             loan.email],
    ['Loan Type',         loan.loanType],
    ['Loan Amount',       formatCurrency(loan.loanAmount)],
    ['Outstanding',       formatCurrency(loan.outstanding)],
    ['Days Past Due',     `${loan.dpd} days`],
    ['Classification',    loan.classification],
    ['Interest Rate',     formatPercent(loan.interestRate, 1)],
    ['Disbursement Date', formatDate(loan.disbursementDate)],
    ['Maturity Date',     formatDate(loan.maturityDate)],
    ['Last Payment Date', formatDate(loan.lastPaymentDate)],
    ['Collateral',        loan.collateral],
    ['Collateral Value',  formatCurrency(loan.collateralValue)],
    ['Branch',            loan.branch],
    ['Loan Officer',      loan.officer],
    ['Provision Required',formatCurrency(loan.provision)],
    ['Risk Score',        `${loan.riskScore} / 100`],
  ]

  return (
    <Modal isOpen={!!loan} onClose={onClose} title={`Loan Details — ${loan.id}`} size="lg">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">{loan.customerName}</p>
          <p className="text-sm text-gray-400">{loan.customerId}</p>
        </div>
        <RiskBadge classification={loan.classification} showDot />
        <NPLBadge isNPL={loan.isNPL} />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(([label, val]) => (
          <div key={label} className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <span className="text-sm text-gray-800 font-medium mt-0.5">{val ?? '—'}</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function Loans() {
  const {
    loans, allLoans, loading, total,
    search, setSearch,
    filters, updateFilter, clearFilters,
    sortConfig, toggleSort,
  } = useLoans()

  const [selectedLoan,   setSelectedLoan]   = useState(null)
  const [showFilters,    setShowFilters]     = useState(false)

  const hasActiveFilters = Object.keys(filters).some(k => filters[k])

  const SortBtn = ({ col, label }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-blue-600 transition-colors group">
      {label}
      <span className="text-gray-300 group-hover:text-blue-400 text-[10px]">
        {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    </button>
  )

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            Showing <span className="font-semibold text-gray-700">{total}</span> of {allLoans.length} loans
            {hasActiveFilters && <span className="text-blue-600 ml-1">(filtered)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary" size="sm" icon={SlidersHorizontal}
            onClick={() => setShowFilters(v => !v)}
          >
            Filters {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </Button>
          <Button
            variant="secondary" size="sm" icon={Download}
            onClick={() => exportLoansToExcel(loans)}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by loan ID, customer name, branch, or officer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select label="Classification" value={filters.classification ?? ''} onChange={e => updateFilter('classification', e.target.value)}>
              <option value="">All Classifications</option>
              {CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="NPL Status" value={filters.nplOnly ? 'npl' : ''} onChange={e => updateFilter('nplOnly', e.target.value === 'npl' ? true : undefined)}>
              <option value="">All Loans</option>
              <option value="npl">NPL Only</option>
            </Select>
            <Select label="Branch" value={filters.branch ?? ''} onChange={e => updateFilter('branch', e.target.value)}>
              <option value="">All Branches</option>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </Select>
            <Select label="Loan Type" value={filters.loanType ?? ''} onChange={e => updateFilter('loanType', e.target.value)}>
              <option value="">All Types</option>
              {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          )}
        </Card>
      )}

      {/* ── Table ── */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  ['id', 'Loan ID'], ['customerName', 'Customer'], ['loanType', 'Type'],
                  ['outstanding', 'Outstanding'], ['dpd', 'DPD'], ['classification', 'Classification'],
                  ['isNPL', 'Status'], ['provision', 'Provision'], ['riskScore', 'Risk'], ['branch', 'Branch'],
                ].map(([key, label]) => (
                  <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <SortBtn col={key} label={label} />
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={11} className="p-0"><TableSkeleton rows={8} cols={10} /></td></tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Filter size={28} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium">No loans match your filters</p>
                  </td>
                </tr>
              ) : loans.map(loan => (
                <tr
                  key={loan.id}
                  className={clsx('hover:bg-gray-50/70 transition-colors', loan.isNPL && 'bg-red-50/30')}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 whitespace-nowrap">{loan.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{loan.customerName}</p>
                    <p className="text-[11px] text-gray-400">{loan.customerId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{loan.loanType}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(loan.outstanding)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('font-bold',
                      loan.dpd >= 180 ? 'text-red-900' : loan.dpd >= 90 ? 'text-red-600' :
                      loan.dpd >= 60  ? 'text-orange-600' : loan.dpd >= 30 ? 'text-amber-600' : 'text-green-600'
                    )}>{loan.dpd}d</span>
                  </td>
                  <td className="px-4 py-3"><RiskBadge classification={loan.classification} showDot /></td>
                  <td className="px-4 py-3"><NPLBadge isNPL={loan.isNPL} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatCurrency(loan.provision)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full', loan.riskScore >= 70 ? 'bg-red-500' : loan.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500')} style={{ width: `${loan.riskScore}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{loan.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{loan.branch}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedLoan(loan)} className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  )
}
