import { createContext, useState, useCallback, useMemo } from 'react'
import { MOCK_LOANS, MOCK_ALERTS } from '../data/mockData'
import {
  calculateNPLRatio,
  calculateCoverageRatio,
  classifyByDPD,
  calculateProvision,
  calculateRiskScore,
  isNPL,
} from '../utils/calculateRisk'
import toast from 'react-hot-toast'

export const LoanContext = createContext(null)

export function LoanProvider({ children }) {
  const [loans, setLoans]         = useState(MOCK_LOANS)
  const [alerts, setAlerts]       = useState(MOCK_ALERTS)
  const [loading, setLoading]     = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // ─── Derived KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalPortfolio  = loans.reduce((s, l) => s + l.outstanding, 0)
    const nplLoans        = loans.filter(l => l.isNPL)
    const nplAmount       = nplLoans.reduce((s, l) => s + l.outstanding, 0)
    const nplRatio        = calculateNPLRatio(loans)
    const coverageRatio   = calculateCoverageRatio(loans)
    const totalProvision  = loans.reduce((s, l) => s + (l.provision ?? 0), 0)
    const activeAlerts    = alerts.filter(a => a.status === 'active').length

    return {
      totalLoans:      loans.length,
      totalPortfolio,
      nplCount:        nplLoans.length,
      nplAmount,
      nplRatio,
      coverageRatio,
      totalProvision,
      activeAlerts,
      borrowersAtRisk: loans.filter(l => l.dpd >= 30).length,
      watchList:       loans.filter(l => l.dpd >= 30 && l.dpd < 60).length,
    }
  }, [loans, alerts])

  // ─── Actions ───────────────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLastUpdated(new Date())
    setLoading(false)
    toast.success('Data refreshed successfully')
  }, [])

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a)
    )
  }, [])

  const resolveAlert = useCallback((alertId) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
          : a
      )
    )
    toast.success('Alert resolved')
  }, [])

  const updateLoan = useCallback((id, updates) => {
    setLoans(prev =>
      prev.map(l => {
        if (l.id !== id) return l
        const updated        = { ...l, ...updates }
        const classification = classifyByDPD(updated.dpd)
        const provision      = calculateProvision(updated.outstanding, classification)
        const riskScore      = calculateRiskScore(updated)
        return { ...updated, classification, provision, riskScore, isNPL: isNPL(updated.dpd) }
      })
    )
    toast.success('Loan record updated')
  }, [])

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev])
  }, [])

  return (
    <LoanContext.Provider
      value={{
        loans, alerts, kpis, loading, lastUpdated,
        refreshData, acknowledgeAlert, resolveAlert, updateLoan, addAlert,
      }}
    >
      {children}
    </LoanContext.Provider>
  )
}
