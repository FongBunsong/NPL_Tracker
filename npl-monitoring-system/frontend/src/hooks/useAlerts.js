import { useContext, useState, useMemo } from 'react'
import { LoanContext } from '../context/LoanContext'
import { PRIORITY_ORDER } from '../utils/constants'

export function useAlerts() {
  const { alerts, acknowledgeAlert, resolveAlert } = useContext(LoanContext)
  const [statusFilter,   setStatusFilter]   = useState('all')    // all | active | acknowledged | resolved
  const [priorityFilter, setPriorityFilter] = useState('all')    // all | critical | high | medium

  const filtered = useMemo(() => {
    let result = [...alerts]
    if (statusFilter   !== 'all') result = result.filter(a => a.status   === statusFilter)
    if (priorityFilter !== 'all') result = result.filter(a => a.priority === priorityFilter)
    return result.sort((a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    )
  }, [alerts, statusFilter, priorityFilter])

  const stats = useMemo(() => ({
    total:        alerts.length,
    active:       alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved:     alerts.filter(a => a.status === 'resolved').length,
    critical:     alerts.filter(a => a.priority === 'critical').length,
    high:         alerts.filter(a => a.priority === 'high').length,
  }), [alerts])

  return {
    alerts: filtered,
    allAlerts: alerts,
    stats,
    statusFilter,   setStatusFilter,
    priorityFilter, setPriorityFilter,
    acknowledgeAlert,
    resolveAlert,
  }
}
