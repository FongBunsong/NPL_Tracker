import { classifyByDPD, calculateProvision, calculateRiskScore, isNPL } from '../utils/calculateRisk'

// ─── Raw Loan Seed Data ───────────────────────────────────────────────────────
const rawLoans = [
  { id: 'L-2024-001', customerId: 'C001', customerName: 'Sopheap Chhay',    loanAmount: 50000,  outstanding: 47500,  disbursementDate: '2023-03-15', maturityDate: '2026-03-15', dpd: 0,   interestRate: 12, loanType: 'Mortgage',         collateral: 'Real Estate',        collateralValue: 90000,  lastPaymentDate: '2024-05-01', branch: 'Head Office',         officer: 'Dara Meas',     phone: '+855 12 345 678', email: 'sopheap@email.com'    },
  { id: 'L-2024-002', customerId: 'C002', customerName: 'Piseth Keo',        loanAmount: 25000,  outstanding: 22000,  disbursementDate: '2023-06-01', maturityDate: '2026-06-01', dpd: 35,  interestRate: 15, loanType: 'SME Loan',          collateral: 'Equipment',          collateralValue: 30000,  lastPaymentDate: '2024-04-05', branch: 'Phnom Penh Branch',   officer: 'Sokha Lim',     phone: '+855 77 234 567', email: 'piseth@email.com'     },
  { id: 'L-2024-003', customerId: 'C003', customerName: 'Chantrea Sok',      loanAmount: 15000,  outstanding: 13500,  disbursementDate: '2022-12-01', maturityDate: '2025-12-01', dpd: 92,  interestRate: 18, loanType: 'Term Loan',         collateral: 'Vehicle',            collateralValue: 12000,  lastPaymentDate: '2024-02-15', branch: 'Siem Reap Branch',    officer: 'Vanna Heng',    phone: '+855 85 345 678', email: 'chantrea@email.com'   },
  { id: 'L-2024-004', customerId: 'C004', customerName: 'Ratha Pov',         loanAmount: 80000,  outstanding: 75000,  disbursementDate: '2023-01-10', maturityDate: '2027-01-10', dpd: 0,   interestRate: 11, loanType: 'Mortgage',         collateral: 'Real Estate',        collateralValue: 150000, lastPaymentDate: '2024-05-08', branch: 'Head Office',         officer: 'Dara Meas',     phone: '+855 12 456 789', email: 'ratha@email.com'      },
  { id: 'L-2024-005', customerId: 'C005', customerName: 'Bopha Ngan',        loanAmount: 8000,   outstanding: 7200,   disbursementDate: '2023-08-15', maturityDate: '2025-08-15', dpd: 185, interestRate: 22, loanType: 'Microfinance',     collateral: 'None',               collateralValue: 0,      lastPaymentDate: '2023-11-20', branch: 'Battambang Branch',   officer: 'Leakhena Sam',  phone: '+855 16 567 890', email: 'bopha@email.com'      },
  { id: 'L-2024-006', customerId: 'C006', customerName: 'Vibol Khim',        loanAmount: 120000, outstanding: 115000, disbursementDate: '2022-09-01', maturityDate: '2027-09-01', dpd: 65,  interestRate: 13, loanType: 'SME Loan',          collateral: 'Commercial Property',collateralValue: 200000, lastPaymentDate: '2024-03-01', branch: 'Head Office',         officer: 'Sokha Lim',     phone: '+855 99 678 901', email: 'vibol@email.com'      },
  { id: 'L-2024-007', customerId: 'C007', customerName: 'Sreymom Chy',       loanAmount: 30000,  outstanding: 28000,  disbursementDate: '2023-04-20', maturityDate: '2026-04-20', dpd: 0,   interestRate: 14, loanType: 'Term Loan',         collateral: 'Vehicle',            collateralValue: 35000,  lastPaymentDate: '2024-05-10', branch: 'Kampong Cham',        officer: 'Vanna Heng',    phone: '+855 78 789 012', email: 'sreymom@email.com'    },
  { id: 'L-2024-008', customerId: 'C008', customerName: 'Makara Chea',       loanAmount: 45000,  outstanding: 42000,  disbursementDate: '2023-02-28', maturityDate: '2026-02-28', dpd: 130, interestRate: 16, loanType: 'Term Loan',         collateral: 'Real Estate',        collateralValue: 60000,  lastPaymentDate: '2024-01-05', branch: 'Phnom Penh Branch',   officer: 'Dara Meas',     phone: '+855 92 890 123', email: 'makara@email.com'     },
  { id: 'L-2024-009', customerId: 'C009', customerName: 'Kosal Pen',         loanAmount: 200000, outstanding: 185000, disbursementDate: '2022-07-15', maturityDate: '2027-07-15', dpd: 0,   interestRate: 10, loanType: 'Mortgage',         collateral: 'Real Estate',        collateralValue: 350000, lastPaymentDate: '2024-05-07', branch: 'Head Office',         officer: 'Leakhena Sam',  phone: '+855 11 901 234', email: 'kosal@email.com'      },
  { id: 'L-2024-010', customerId: 'C010', customerName: 'Dara Rin',          loanAmount: 18000,  outstanding: 16500,  disbursementDate: '2023-11-01', maturityDate: '2025-11-01', dpd: 48,  interestRate: 20, loanType: 'Microfinance',     collateral: 'None',               collateralValue: 0,      lastPaymentDate: '2024-04-01', branch: 'Kampot Branch',       officer: 'Vanna Heng',    phone: '+855 68 012 345', email: 'dara@email.com'       },
  { id: 'L-2024-011', customerId: 'C011', customerName: 'Molika Tep',        loanAmount: 60000,  outstanding: 58000,  disbursementDate: '2023-05-10', maturityDate: '2028-05-10', dpd: 75,  interestRate: 13, loanType: 'SME Loan',          collateral: 'Commercial Property',collateralValue: 80000,  lastPaymentDate: '2024-03-10', branch: 'Siem Reap Branch',    officer: 'Sokha Lim',     phone: '+855 89 123 456', email: 'molika@email.com'     },
  { id: 'L-2024-012', customerId: 'C012', customerName: 'Chamroeun Nhem',    loanAmount: 35000,  outstanding: 33500,  disbursementDate: '2023-07-22', maturityDate: '2026-07-22', dpd: 200, interestRate: 19, loanType: 'Term Loan',         collateral: 'Vehicle',            collateralValue: 25000,  lastPaymentDate: '2023-10-25', branch: 'Battambang Branch',   officer: 'Leakhena Sam',  phone: '+855 17 234 567', email: 'chamroeun@email.com'  },
  { id: 'L-2024-013', customerId: 'C013', customerName: 'Ratanak Yem',       loanAmount: 5000,   outstanding: 4800,   disbursementDate: '2024-01-05', maturityDate: '2025-01-05', dpd: 0,   interestRate: 24, loanType: 'Microfinance',     collateral: 'None',               collateralValue: 0,      lastPaymentDate: '2024-05-05', branch: 'Kampong Cham',        officer: 'Dara Meas',     phone: '+855 96 345 678', email: 'ratanak@email.com'    },
  { id: 'L-2024-014', customerId: 'C014', customerName: 'Sothea Khoun',      loanAmount: 90000,  outstanding: 86000,  disbursementDate: '2022-11-15', maturityDate: '2027-11-15', dpd: 110, interestRate: 12, loanType: 'SME Loan',          collateral: 'Real Estate',        collateralValue: 120000, lastPaymentDate: '2024-02-01', branch: 'Head Office',         officer: 'Sokha Lim',     phone: '+855 23 456 789', email: 'sothea@email.com'     },
  { id: 'L-2024-015', customerId: 'C015', customerName: 'Navuth Ean',        loanAmount: 12000,  outstanding: 11200,  disbursementDate: '2023-09-01', maturityDate: '2025-09-01', dpd: 22,  interestRate: 21, loanType: 'Microfinance',     collateral: 'None',               collateralValue: 0,      lastPaymentDate: '2024-04-20', branch: 'Kampot Branch',       officer: 'Vanna Heng',    phone: '+855 10 567 890', email: 'navuth@email.com'     },
  { id: 'L-2024-016', customerId: 'C016', customerName: 'Channary Long',     loanAmount: 75000,  outstanding: 70000,  disbursementDate: '2022-05-10', maturityDate: '2027-05-10', dpd: 0,   interestRate: 11, loanType: 'Mortgage',         collateral: 'Real Estate',        collateralValue: 130000, lastPaymentDate: '2024-05-09', branch: 'Phnom Penh Branch',   officer: 'Dara Meas',     phone: '+855 23 678 901', email: 'channary@email.com'   },
  { id: 'L-2024-017', customerId: 'C017', customerName: 'Bunthoeun Mao',     loanAmount: 40000,  outstanding: 38500,  disbursementDate: '2023-10-01', maturityDate: '2026-10-01', dpd: 55,  interestRate: 17, loanType: 'Term Loan',         collateral: 'Equipment',          collateralValue: 45000,  lastPaymentDate: '2024-03-20', branch: 'Siem Reap Branch',    officer: 'Vanna Heng',    phone: '+855 81 789 012', email: 'bunthoeun@email.com'  },
  { id: 'L-2024-018', customerId: 'C018', customerName: 'Seila Oun',         loanAmount: 22000,  outstanding: 20000,  disbursementDate: '2023-07-15', maturityDate: '2025-07-15', dpd: 145, interestRate: 16, loanType: 'SME Loan',          collateral: 'Inventory',          collateralValue: 18000,  lastPaymentDate: '2023-12-20', branch: 'Battambang Branch',   officer: 'Leakhena Sam',  phone: '+855 87 890 123', email: 'seila@email.com'      },
  { id: 'L-2024-019', customerId: 'C019', customerName: 'Kimhak Ros',        loanAmount: 9500,   outstanding: 8700,   disbursementDate: '2024-02-01', maturityDate: '2025-02-01', dpd: 0,   interestRate: 23, loanType: 'Microfinance',     collateral: 'None',               collateralValue: 0,      lastPaymentDate: '2024-05-03', branch: 'Kampot Branch',       officer: 'Vanna Heng',    phone: '+855 76 901 234', email: 'kimhak@email.com'     },
  { id: 'L-2024-020', customerId: 'C020', customerName: 'Phallin Khuth',     loanAmount: 155000, outstanding: 148000, disbursementDate: '2021-08-01', maturityDate: '2026-08-01', dpd: 0,   interestRate: 10, loanType: 'Mortgage',         collateral: 'Real Estate',        collateralValue: 280000, lastPaymentDate: '2024-05-06', branch: 'Head Office',         officer: 'Dara Meas',     phone: '+855 98 012 345', email: 'phallin@email.com'    },
]

export const MOCK_LOANS = rawLoans.map(loan => {
  const classification = classifyByDPD(loan.dpd)
  const provision      = calculateProvision(loan.outstanding, classification)
  const riskScore      = calculateRiskScore({ ...loan, classification })
  return {
    ...loan,
    classification,
    isNPL: isNPL(loan.dpd),
    provision,
    riskScore,
    utilizationRate: (loan.outstanding / loan.loanAmount) * 100,
  }
})

// ─── Mock Alerts ──────────────────────────────────────────────────────────────
export const MOCK_ALERTS = [
  { id: 'A-001', type: 'DPD_90',         loanId: 'L-2024-003', customerId: 'C003', customerName: 'Chantrea Sok',   priority: 'critical', message: 'L-2024-003 has reached 92 DPD — classified as Doubtful. Provision required: $6,750.',                                    createdAt: '2024-05-10T09:15:00', status: 'active',       amount: 13500,  resolvedAt: null },
  { id: 'A-002', type: 'DPD_60',         loanId: 'L-2024-006', customerId: 'C006', customerName: 'Vibol Khim',     priority: 'high',     message: 'L-2024-006 passed 60 DPD — now classified as Substandard (NPL). Outstanding: $115,000.',                               createdAt: '2024-05-09T14:30:00', status: 'active',       amount: 115000, resolvedAt: null },
  { id: 'A-003', type: 'NPL_RATIO_HIGH', loanId: null,         customerId: null,   customerName: null,             priority: 'critical', message: 'Portfolio NPL Ratio has exceeded 5% threshold — current rate: 7.8%. Immediate management review required.',               createdAt: '2024-05-09T08:00:00', status: 'active',       amount: null,   resolvedAt: null },
  { id: 'A-004', type: 'DPD_90',         loanId: 'L-2024-008', customerId: 'C008', customerName: 'Makara Chea',    priority: 'critical', message: 'L-2024-008 at 130 DPD — Doubtful. Required provision: $21,000. Collateral assessment needed.',                           createdAt: '2024-05-08T10:45:00', status: 'active',       amount: 42000,  resolvedAt: null },
  { id: 'A-005', type: 'DPD_180',        loanId: 'L-2024-005', customerId: 'C005', customerName: 'Bopha Ngan',     priority: 'critical', message: 'L-2024-005 at 185 DPD — classified as Loss. Full provision ($7,200) required. Write-off candidate.',                      createdAt: '2024-05-07T11:00:00', status: 'acknowledged', amount: 7200,   resolvedAt: null },
  { id: 'A-006', type: 'DPD_180',        loanId: 'L-2024-012', customerId: 'C012', customerName: 'Chamroeun Nhem', priority: 'critical', message: 'L-2024-012 at 200 DPD — Loss classification. Full provision ($33,500) required. Legal action recommended.',               createdAt: '2024-05-06T16:30:00', status: 'acknowledged', amount: 33500,  resolvedAt: null },
  { id: 'A-007', type: 'DPD_30',         loanId: 'L-2024-002', customerId: 'C002', customerName: 'Piseth Keo',     priority: 'medium',   message: 'L-2024-002 has reached 35 DPD — Special Mention. Follow-up call required within 48 hours.',                              createdAt: '2024-05-05T09:00:00', status: 'active',       amount: 22000,  resolvedAt: null },
  { id: 'A-008', type: 'DPD_30',         loanId: 'L-2024-010', customerId: 'C010', customerName: 'Dara Rin',       priority: 'medium',   message: 'L-2024-010 approaching 48 DPD — contact borrower immediately to prevent NPL entry.',                                       createdAt: '2024-05-04T13:20:00', status: 'resolved',     amount: 16500,  resolvedAt: '2024-05-05T10:30:00' },
  { id: 'A-009', type: 'DPD_90',         loanId: 'L-2024-014', customerId: 'C014', customerName: 'Sothea Khoun',   priority: 'critical', message: 'L-2024-014 at 110 DPD — Doubtful. Collateral (Real Estate) assessment required. Provision: $43,000.',                    createdAt: '2024-05-03T08:30:00', status: 'active',       amount: 86000,  resolvedAt: null },
  { id: 'A-010', type: 'DPD_60',         loanId: 'L-2024-011', customerId: 'C011', customerName: 'Molika Tep',     priority: 'high',     message: 'L-2024-011 at 75 DPD — Substandard (NPL). Recovery officer assigned. Provision: $11,600.',                               createdAt: '2024-05-02T15:00:00', status: 'acknowledged', amount: 58000,  resolvedAt: null },
  { id: 'A-011', type: 'DPD_90',         loanId: 'L-2024-018', customerId: 'C018', customerName: 'Seila Oun',      priority: 'critical', message: 'L-2024-018 at 145 DPD — Doubtful. Outstanding: $20,000. LTV ratio exceeds 100%.',                                         createdAt: '2024-05-01T10:00:00', status: 'active',       amount: 20000,  resolvedAt: null },
  { id: 'A-012', type: 'DPD_30',         loanId: 'L-2024-017', customerId: 'C017', customerName: 'Bunthoeun Mao',  priority: 'medium',   message: 'L-2024-017 at 55 DPD — approaching NPL threshold (60 DPD). Intervention required.',                                       createdAt: '2024-04-30T14:00:00', status: 'resolved',     amount: 38500,  resolvedAt: '2024-05-01T09:00:00' },
]

// ─── Historical NPL Trend (last 7 months) ────────────────────────────────────
export const MOCK_MONTHLY_TREND = [
  { month: 'Nov', nplRatio: 4.2, totalNPL: 180000, totalPortfolio: 4285714, newNPL: 2 },
  { month: 'Dec', nplRatio: 4.8, totalNPL: 210000, totalPortfolio: 4375000, newNPL: 3 },
  { month: 'Jan', nplRatio: 5.5, totalNPL: 248000, totalPortfolio: 4509090, newNPL: 4 },
  { month: 'Feb', nplRatio: 6.1, totalNPL: 285000, totalPortfolio: 4672131, newNPL: 3 },
  { month: 'Mar', nplRatio: 7.0, totalNPL: 338000, totalPortfolio: 4828571, newNPL: 5 },
  { month: 'Apr', nplRatio: 7.5, totalNPL: 375000, totalPortfolio: 5000000, newNPL: 4 },
  { month: 'May', nplRatio: 7.8, totalNPL: 408700, totalPortfolio: 5239743, newNPL: 3 },
]

// ─── Monthly Collection Data ──────────────────────────────────────────────────
export const MOCK_COLLECTIONS = [
  { month: 'Nov', collected: 120000, scheduled: 150000, rate: 80.0 },
  { month: 'Dec', collected: 135000, scheduled: 155000, rate: 87.1 },
  { month: 'Jan', collected: 118000, scheduled: 160000, rate: 73.8 },
  { month: 'Feb', collected: 142000, scheduled: 165000, rate: 86.1 },
  { month: 'Mar', collected: 130000, scheduled: 170000, rate: 76.5 },
  { month: 'Apr', collected: 148000, scheduled: 175000, rate: 84.6 },
  { month: 'May', collected: 125000, scheduled: 172000, rate: 72.7 },
]
