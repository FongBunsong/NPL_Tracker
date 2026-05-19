import { useContext, useState, useMemo, useCallback } from 'react'
import { LoanContext } from '../context/LoanContext'

export function useLoans(initialFilters = {}) {
  const { loans, loading, kpis, refreshData, updateLoan } = useContext(LoanContext)
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState(initialFilters)
  const [sortConfig, setSortConfig] = useState({ key: 'dpd', direction: 'desc' })

  const filtered = useMemo(() => {
    let result = [...loans]

    // Text search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.id.toLowerCase().includes(q)            ||
        l.customerName.toLowerCase().includes(q)  ||
        l.customerId.toLowerCase().includes(q)    ||
        l.branch?.toLowerCase().includes(q)       ||
        l.officer?.toLowerCase().includes(q)
      )
    }

    // Filters
    if (filters.nplOnly)         result = result.filter(l => l.isNPL)
    if (filters.classification)  result = result.filter(l => l.classification === filters.classification)
    if (filters.branch)          result = result.filter(l => l.branch === filters.branch)
    if (filters.officer)         result = result.filter(l => l.officer === filters.officer)
    if (filters.loanType)        result = result.filter(l => l.loanType === filters.loanType)
    if (filters.minDpd !== undefined) result = result.filter(l => l.dpd >= filters.minDpd)
    if (filters.maxDpd !== undefined) result = result.filter(l => l.dpd <= filters.maxDpd)

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const av  = a[sortConfig.key]
        const bv  = b[sortConfig.key]
        const dir = sortConfig.direction === 'asc' ? 1 : -1
        if (typeof av === 'number') return (av - bv) * dir
        return String(av ?? '').localeCompare(String(bv ?? '')) * dir
      })
    }

    return result
  }, [loans, search, filters, sortConfig])

  const toggleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearch('')
  }, [])

  return {
    loans: filtered,
    allLoans: loans,
    loading,
    kpis,
    search,       setSearch,
    filters,      updateFilter, clearFilters,
    sortConfig,   toggleSort,
    refreshData,  updateLoan,
    total: filtered.length,
  }
}
