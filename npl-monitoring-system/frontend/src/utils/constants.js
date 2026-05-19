// ─── Loan Classification Thresholds (Days Past Due) ───────────────────────────
export const NPL_CLASSIFICATIONS = {
  PASS:            { label: 'Pass',           min: 0,   max: 29,       color: '#16a34a', bg: '#dcfce7', text: '#15803d' },
  SPECIAL_MENTION: { label: 'Special Mention', min: 30,  max: 59,       color: '#d97706', bg: '#fef3c7', text: '#b45309' },
  SUBSTANDARD:     { label: 'Substandard',    min: 60,  max: 89,       color: '#ea580c', bg: '#ffedd5', text: '#c2410c' },
  DOUBTFUL:        { label: 'Doubtful',       min: 90,  max: 179,      color: '#dc2626', bg: '#fee2e2', text: '#b91c1c' },
  LOSS:            { label: 'Loss',           min: 180, max: Infinity, color: '#991b1b', bg: '#fecaca', text: '#7f1d1d' },
}

// Provision rates per classification (Basel / typical banking standard)
export const PROVISION_RATES = {
  'Pass':            0.01,  // 1%
  'Special Mention': 0.05,  // 5%
  'Substandard':     0.20,  // 20%
  'Doubtful':        0.50,  // 50%
  'Loss':            1.00,  // 100%
}

export const LOAN_TYPES = [
  'Term Loan',
  'Revolving Credit',
  'Overdraft',
  'Mortgage',
  'Microfinance',
  'SME Loan',
]

export const BRANCHES = [
  'Head Office',
  'Phnom Penh Branch',
  'Siem Reap Branch',
  'Battambang Branch',
  'Kampong Cham',
  'Kampot Branch',
]

export const LOAN_OFFICERS = [
  'Dara Meas',
  'Sokha Lim',
  'Vanna Heng',
  'Leakhena Sam',
]

// ─── Alert Configuration ────────────────────────────────────────────────────
export const ALERT_TYPES = {
  DPD_30:            { id: 'DPD_30',            label: '30-Day DPD',        priority: 'medium',   color: 'amber'  },
  DPD_60:            { id: 'DPD_60',            label: '60-Day DPD (NPL)',  priority: 'high',     color: 'orange' },
  DPD_90:            { id: 'DPD_90',            label: '90-Day DPD',        priority: 'critical', color: 'red'    },
  DPD_180:           { id: 'DPD_180',           label: '180-Day DPD (Loss)',priority: 'critical', color: 'red'    },
  NPL_RATIO_HIGH:    { id: 'NPL_RATIO_HIGH',    label: 'NPL Ratio Exceeded',priority: 'critical', color: 'red'    },
  NEW_NPL:           { id: 'NEW_NPL',           label: 'New NPL Entry',     priority: 'high',     color: 'red'    },
  PROVISION_DEFICIT: { id: 'PROVISION_DEFICIT', label: 'Provision Deficit', priority: 'medium',   color: 'amber'  },
}

// Alert if NPL ratio exceeds this threshold (%)
export const NPL_RATIO_ALERT_THRESHOLD = 5

// ─── Navigation ─────────────────────────────────────────────────────────────
export const PAGES = {
  DASHBOARD:  '/',
  LOANS:      '/loans',
  CUSTOMERS:  '/customers',
  ALERTS:     '/alerts',
  REPORTS:    '/reports',
  ANALYTICS:  '/analytics',
  SETTINGS:   '/settings',
}

export const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
