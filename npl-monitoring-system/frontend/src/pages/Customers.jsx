import { useMemo, useState } from 'react'
import { Search, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react'
import { useContext } from 'react'
import { LoanContext }  from '../context/LoanContext'
import Card, { CardHeader } from '../components/ui/Card'
import Modal            from '../components/ui/Modal'
import RiskBadge, { NPLBadge } from '../components/dashboard/RiskBadge'
import { formatCurrency, formatDate, formatPercent } from '../utils/formatCurrency'
import clsx from 'clsx'

function CustomerCard({ customer, onClick }) {
  const highestDPD = Math.max(...customer.loans.map(l => l.dpd))
  const hasNPL     = customer.loans.some(l => l.isNPL)
  const totalExposure = customer.loans.reduce((s, l) => s + l.outstanding, 0)

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all duration-200',
        hasNPL ? 'border-red-200 bg-red-50/20' : 'border-gray-100'
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
          hasNPL ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
        )}>
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
          <p className="text-xs text-gray-400">{customer.id}</p>
        </div>
        {hasNPL && <NPLBadge isNPL />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400">Total Exposure</p>
          <p className="font-semibold text-gray-900 text-sm">{formatCurrency(totalExposure)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Loans</p>
          <p className="font-semibold text-gray-900 text-sm">{customer.loans.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Highest DPD</p>
          <p className={clsx('font-bold text-sm', highestDPD >= 90 ? 'text-red-600' : highestDPD >= 60 ? 'text-orange-600' : highestDPD >= 30 ? 'text-amber-600' : 'text-green-600')}>
            {highestDPD}d
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Branch</p>
          <p className="text-sm text-gray-600 truncate">{customer.loans[0]?.branch ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}

function CustomerModal({ customer, onClose }) {
  if (!customer) return null
  return (
    <Modal isOpen={!!customer} onClose={onClose} title="Customer Profile" size="lg">
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
          <p className="text-gray-400 text-sm">{customer.id}</p>
          <div className="flex items-center gap-2 mt-2">
            {customer.loans.some(l => l.isNPL) && <NPLBadge isNPL />}
            <RiskBadge classification={customer.loans.reduce((worst, l) => {
              const order = ['Loss', 'Doubtful', 'Substandard', 'Special Mention', 'Pass']
              return order.indexOf(l.classification) < order.indexOf(worst) ? l.classification : worst
            }, 'Pass')} showDot />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: Phone, label: 'Phone', value: customer.loans[0]?.phone },
          { icon: Mail,  label: 'Email', value: customer.loans[0]?.email },
          { icon: MapPin,label: 'Branch',value: customer.loans[0]?.branch },
          { icon: User,  label: 'Officer',value: customer.loans[0]?.officer },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Icon size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-700">{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      <h4 className="font-semibold text-gray-800 mb-3">Loan Portfolio</h4>
      <div className="space-y-2">
        {customer.loans.map(loan => (
          <div key={loan.id} className={clsx('flex items-center justify-between p-3 rounded-xl border', loan.isNPL ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100')}>
            <div>
              <p className="font-mono text-xs font-semibold text-blue-600">{loan.id}</p>
              <p className="text-xs text-gray-500">{loan.loanType} · {loan.branch}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">{formatCurrency(loan.outstanding)}</p>
              <p className={clsx('text-xs font-bold', loan.dpd >= 90 ? 'text-red-600' : loan.dpd >= 60 ? 'text-orange-600' : loan.dpd >= 30 ? 'text-amber-600' : 'text-green-600')}>
                {loan.dpd}d DPD
              </p>
            </div>
            <RiskBadge classification={loan.classification} showDot />
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function Customers() {
  const { loans } = useContext(LoanContext)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')

  // Group loans by customer
  const customers = useMemo(() => {
    const map = {}
    loans.forEach(l => {
      if (!map[l.customerId]) map[l.customerId] = { id: l.customerId, name: l.customerName, loans: [] }
      map[l.customerId].loans.push(l)
    })
    return Object.values(map)
  }, [loans])

  const filtered = useMemo(() => {
    let result = customers
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    }
    if (filter === 'npl')      result = result.filter(c => c.loans.some(l => l.isNPL))
    if (filter === 'watch')    result = result.filter(c => c.loans.some(l => l.dpd >= 30 && l.dpd < 60))
    if (filter === 'current')  result = result.filter(c => c.loans.every(l => l.dpd < 30))
    return result
  }, [customers, search, filter])

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-gray-900' },
          { label: 'With NPL',        value: customers.filter(c => c.loans.some(l => l.isNPL)).length, color: 'text-red-600' },
          { label: 'At Risk (30+d)',  value: customers.filter(c => c.loans.some(l => l.dpd >= 30)).length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={clsx('text-3xl font-extrabold mt-1', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search customers…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-4"
          />
        </div>
        <div className="flex gap-1.5">
          {[['all', 'All'], ['npl', 'NPL'], ['watch', 'Watch List'], ['current', 'Current']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={clsx('px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors', filter === val ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <CustomerCard key={c.id} customer={c} onClick={() => setSelected(c)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <User size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No customers found</p>
          </div>
        )}
      </div>

      <CustomerModal customer={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
