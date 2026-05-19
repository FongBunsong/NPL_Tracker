import { useNavigate } from 'react-router-dom'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import RiskBadge, { NPLBadge } from './RiskBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { useLoans }       from '../../hooks/useLoans'
import { TableSkeleton }  from '../ui/Loader'
import clsx from 'clsx'

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-gray-300" />
  return sortConfig.direction === 'asc'
    ? <ArrowUp   size={12} className="text-blue-600" />
    : <ArrowDown size={12} className="text-blue-600" />
}

const HEADERS = [
  { key: 'id',             label: 'Loan ID',      sortable: true  },
  { key: 'customerName',   label: 'Customer',     sortable: true  },
  { key: 'outstanding',    label: 'Outstanding',  sortable: true  },
  { key: 'dpd',            label: 'DPD',          sortable: true  },
  { key: 'classification', label: 'Class.',       sortable: true  },
  { key: 'isNPL',          label: 'Status',       sortable: false },
  { key: 'provision',      label: 'Provision',    sortable: true  },
  { key: 'riskScore',      label: 'Risk Score',   sortable: true  },
]

export default function LoanTable({
  maxRows,
  nplOnly    = false,
  showSearch = false,
  compact    = false,
}) {
  const { loans, sortConfig, toggleSort, search, setSearch, loading } =
    useLoans(nplOnly ? { nplOnly: true } : {})
  const navigate = useNavigate()

  const displayed = maxRows ? loans.slice(0, maxRows) : loans

  return (
    <div>
      {showSearch && (
        <input
          type="text"
          placeholder="Search by loan ID, customer name, branch…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-3 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              {HEADERS.map(h => (
                <th key={h.key} className={compact ? 'text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 whitespace-nowrap' : undefined}>
                  {h.sortable ? (
                    <button
                      onClick={() => toggleSort(h.key)}
                      className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                    >
                      {h.label} <SortIcon column={h.key} sortConfig={sortConfig} />
                    </button>
                  ) : h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={HEADERS.length} className="p-0">
                  <TableSkeleton rows={5} cols={HEADERS.length} />
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No loans found
                </td>
              </tr>
            ) : (
              displayed.map(loan => (
                <tr
                  key={loan.id}
                  onClick={() => navigate('/loans')}
                  className={clsx(
                    'cursor-pointer transition-colors',
                    loan.isNPL ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50/70'
                  )}
                >
                  <td className={compact ? 'px-3 py-2 font-mono text-[11px] font-medium text-blue-600 border-b border-gray-50' : undefined}>
                    <span className="font-mono text-xs font-medium text-blue-600">{loan.id}</span>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{loan.customerName}</p>
                      <p className="text-[11px] text-gray-400">{loan.customerId}</p>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(loan.outstanding)}
                    </span>
                  </td>
                  <td>
                    <span className={clsx(
                      'font-bold text-sm',
                      loan.dpd >= 180 ? 'text-red-800'   :
                      loan.dpd >= 90  ? 'text-red-600'   :
                      loan.dpd >= 60  ? 'text-orange-600' :
                      loan.dpd >= 30  ? 'text-amber-600'  : 'text-green-600'
                    )}>
                      {loan.dpd}d
                    </span>
                  </td>
                  <td><RiskBadge classification={loan.classification} showDot /></td>
                  <td><NPLBadge isNPL={loan.isNPL} /></td>
                  <td className="text-gray-500">{formatCurrency(loan.provision)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            loan.riskScore >= 70 ? 'bg-red-500'   :
                            loan.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'
                          )}
                          style={{ width: `${loan.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{loan.riskScore}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
