import type {
  PropertyData, ProfileData, ScenarioData, AmortizationPoint,
  ReadinessData, JourneyPhase, ClientData, AdvisorMetrics,
  InsightEvent, HomeownerData, EquityPoint, PriceBand, StressScenario
} from './types'

// ── Financial Calculation Helpers ────────────────────────────────────────────
export function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function calcPMI(loanAmount: number, homePrice: number): number {
  const ltv = loanAmount / homePrice
  if (ltv <= 0.80) return 0
  return (loanAmount * 0.0075) / 12 // ~0.75% annual PMI
}

export function calcCashToClose(homePrice: number, downPercent: number): number {
  const down = homePrice * (downPercent / 100)
  const closingCosts = homePrice * 0.025 // ~2.5% closing costs
  return down + closingCosts
}

export function generateAmortization(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationPoint[] {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  const payment = calcMonthlyPayment(principal, annualRate, termYears)
  let balance = principal
  let totalInterest = 0
  let totalPaid = 0
  const points: AmortizationPoint[] = []

  for (let year = 0; year <= termYears; year++) {
    if (year === 0) {
      points.push({ year, principal: 0, interest: 0, balance: principal, totalPaid: 0 })
      continue
    }
    let yearInterest = 0
    let yearPrincipal = 0
    for (let m = 0; m < 12; m++) {
      const interestPayment = balance * r
      const principalPayment = payment - interestPayment
      yearInterest += interestPayment
      yearPrincipal += principalPayment
      balance = Math.max(0, balance - principalPayment)
      totalInterest += interestPayment
      totalPaid += payment
    }
    points.push({
      year,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.round(balance),
      totalPaid: Math.round(totalPaid),
    })
    if (balance <= 0) break
  }
  return points
}

export function generateEquityHistory(
  purchasePrice: number,
  annualRate: number,
  termYears: number,
  annualAppreciation = 0.04
): EquityPoint[] {
  const r = annualRate / 100 / 12
  const payment = calcMonthlyPayment(purchasePrice * 0.8, annualRate, termYears)
  let balance = purchasePrice * 0.8
  const points: EquityPoint[] = []
  const checkpoints = [0, 12, 24, 36, 60, 84, 120, 180, 240, 300, 360]

  for (const month of checkpoints) {
    if (month > termYears * 12) break
    let b = purchasePrice * 0.8
    for (let m = 0; m < month; m++) {
      const interest = b * r
      const principal = payment - interest
      b = Math.max(0, b - principal)
    }
    const homeValue = purchasePrice * Math.pow(1 + annualAppreciation, month / 12)
    const equity = homeValue - b
    points.push({
      month,
      label: month === 0 ? 'Close' : month < 12 ? `Mo ${month}` : `Yr ${month / 12}`,
      homeValue: Math.round(homeValue),
      loanBalance: Math.round(b),
      equity: Math.round(equity),
      equityPct: Math.round((equity / homeValue) * 100),
    })
  }
  return points
}

// ── Properties ───────────────────────────────────────────────────────────────
export const MOCK_PROPERTIES: PropertyData[] = [
  {
    id: 'prop-1',
    address: '2847 Waverly Hills Drive',
    city: 'Austin', state: 'TX', zip: '78703',
    price: 685000, beds: 4, baths: 3, sqft: 2480, lotSqft: 7200,
    type: 'single_family', yearBuilt: 2018, daysOnMarket: 12,
    pricePerSqft: 276, estimatedTaxes: 1370, estimatedInsurance: 175,
    tags: ['Open House Sat', 'New Roof', 'Updated Kitchen'],
    gradient: 'from-violet-400 via-purple-500 to-indigo-600',
    photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Saves $650/mo vs your ceiling',
  },
  {
    id: 'prop-2',
    address: '504 Meridian Court',
    city: 'Austin', state: 'TX', zip: '78701',
    price: 549000, beds: 3, baths: 2, sqft: 1920, lotSqft: 4800,
    type: 'townhouse', yearBuilt: 2021, daysOnMarket: 5,
    pricePerSqft: 286, hoa: 285, estimatedTaxes: 1098, estimatedInsurance: 142,
    tags: ['Price Drop', 'Low HOA'],
    gradient: 'from-blue-400 via-cyan-500 to-teal-500',
    photo: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Price drop + lowest total carrying cost',
  },
  {
    id: 'prop-3',
    address: '1190 Barton Springs Rd, #8B',
    city: 'Austin', state: 'TX', zip: '78704',
    price: 425000, beds: 2, baths: 2, sqft: 1340,
    type: 'condo', yearBuilt: 2016, daysOnMarket: 31,
    pricePerSqft: 317, hoa: 420, estimatedTaxes: 850, estimatedInsurance: 110,
    tags: ['Pool', 'Gym', 'Concierge'],
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Frees $2,100/mo to invest or save',
  },
  {
    id: 'prop-4',
    address: '3311 Oak Hollow Lane',
    city: 'Round Rock', state: 'TX', zip: '78665',
    price: 595000, beds: 4, baths: 3.5, sqft: 2900, lotSqft: 9600,
    type: 'single_family', yearBuilt: 2020, daysOnMarket: 8,
    pricePerSqft: 205, estimatedTaxes: 1190, estimatedInsurance: 158,
    tags: ['Best Value', 'Large Yard'],
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Best value/sqft in your search · $205/sf',
  },
  {
    id: 'prop-5',
    address: '7722 Congress Ave, #301',
    city: 'Austin', state: 'TX', zip: '78745',
    price: 375000, beds: 2, baths: 1, sqft: 1120,
    type: 'condo', yearBuilt: 2019, daysOnMarket: 19,
    pricePerSqft: 335, hoa: 310, estimatedTaxes: 750, estimatedInsurance: 98,
    tags: ['City Views', 'Pet Friendly'],
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Maximum monthly flexibility · $3,100/mo freed',
  },
  {
    id: 'prop-6',
    address: '612 Lamar Heights Blvd',
    city: 'Austin', state: 'TX', zip: '78752',
    price: 720000, beds: 5, baths: 4, sqft: 3200, lotSqft: 8800,
    type: 'single_family', yearBuilt: 2022, daysOnMarket: 3,
    pricePerSqft: 225, estimatedTaxes: 1440, estimatedInsurance: 192,
    tags: ['New Construction', 'Solar', 'EV Charger'],
    gradient: 'from-indigo-400 via-blue-500 to-sky-500',
    photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&h=400&q=80',
    goalInsight: 'Zero renovation risk for 5+ years',
  },
]

// ── Financial Profile ─────────────────────────────────────────────────────────
export const MOCK_PROFILE: ProfileData = {
  name: 'John Smith',
  initials: 'JS',
  creditScore: 748,
  creditBand: 'very_good',
  income: [
    { id: 'inc-1', label: 'Base Salary — Stripe, Inc.', type: 'salary', annual: 195000, verified: true },
    { id: 'inc-2', label: 'RSU Vesting Income', type: 'investment', annual: 42000, verified: true },
    { id: 'inc-3', label: 'Rental Income — Condo', type: 'rental', annual: 18000, verified: false },
  ],
  assets: [
    { id: 'ast-1', label: 'Chase Checking', type: 'checking', value: 38500, liquid: true },
    { id: 'ast-2', label: 'Ally HYSA', type: 'savings', value: 94000, liquid: true },
    { id: 'ast-3', label: 'Schwab Brokerage', type: 'investment', value: 185000, liquid: true },
    { id: 'ast-4', label: '401(k) — Fidelity', type: 'retirement', value: 312000, liquid: false },
    { id: 'ast-5', label: 'Roth IRA', type: 'retirement', value: 68000, liquid: false },
  ],
  debts: [
    { id: 'dbt-1', label: 'Tesla Model Y Auto Loan', type: 'auto', balance: 28400, monthlyPayment: 724, rate: 5.9 },
    { id: 'dbt-2', label: 'Chase Sapphire (Revolving)', type: 'credit_card', balance: 4200, monthlyPayment: 126, rate: 21.99 },
    { id: 'dbt-3', label: 'Federal Student Loans', type: 'student', balance: 0, monthlyPayment: 0, rate: 0 },
  ],
  confidence: 82,
  missingSignals: ['Rental income verification needed', '2022 tax return not yet uploaded'],
  buyingPowerMin: 550000,
  buyingPowerMax: 780000,
  frontDTI: 24,
  backDTI: 31,
}

// ── Scenarios ─────────────────────────────────────────────────────────────────
function buildScenario(
  id: string, label: string, strategyType: 'conservative' | 'balanced' | 'optimized',
  loanType: 'conventional' | 'fha' | 'va' | 'arm',
  termYears: 15 | 20 | 30, rate: number, downPercent: number, homePrice: number,
  isRecommended: boolean, insight: string
): ScenarioData {
  const loanAmount = homePrice * (1 - downPercent / 100)
  const monthly = calcMonthlyPayment(loanAmount, rate, termYears)
  const pmi = calcPMI(loanAmount, homePrice)
  const taxes = 1370  // monthly
  const insurance = 175
  const totalMonthly = monthly + pmi + taxes + insurance
  const totalInterest = monthly * termYears * 12 - loanAmount
  const totalCost = homePrice * downPercent / 100 + totalInterest + (taxes + insurance) * termYears * 12
  return {
    id, label, strategyType, loanType, termYears, rate, downPercent, homePrice,
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthly),
    totalMonthly: Math.round(totalMonthly),
    pmi: Math.round(pmi),
    cashToClose: Math.round(calcCashToClose(homePrice, downPercent)),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    isRecommended, insight,
  }
}

export const MOCK_SCENARIOS: ScenarioData[] = [
  buildScenario(
    'scen-1', 'Lower Cash Upfront', 'conservative',
    'fha', 30, 6.875, 3.5, 685000, false,
    'Minimum cash to close. FHA gives access now, but PMI adds ~$380/mo until you reach 20% equity.'
  ),
  buildScenario(
    'scen-2', 'Balanced Recommendation', 'balanced',
    'conventional', 30, 6.625, 10, 685000, true,
    'Strong positioning at this price. 10% down eliminates FHA, keeps cash in market, and qualifies for best conventional pricing.'
  ),
  buildScenario(
    'scen-3', 'Wealth Optimization', 'optimized',
    'conventional', 15, 6.125, 20, 685000, false,
    '20% down eliminates PMI. 15-year builds equity fast. Total interest savings: $198K vs 30-year. Requires highest monthly commitment.'
  ),
]

export function getScenarioAmortization(scenario: ScenarioData): AmortizationPoint[] {
  return generateAmortization(scenario.loanAmount, scenario.rate, scenario.termYears)
}

// ── Readiness ─────────────────────────────────────────────────────────────────
export const MOCK_READINESS: ReadinessData = {
  score: 74,
  grade: 'B',
  daysToReady: 12,
  readinessInsight: 'You\'re in strong shape. Two items — rental income docs and a deposit explanation — would move your pricing tier and cut days-to-close by nearly half.',
  signals: [
    { id: 'sig-1', category: 'income', label: 'W-2 Employment Income', status: 'verified', detail: 'Stripe, Inc. — $195,000/yr confirmed via employer VOE', impact: 'high', lastUpdated: '3 days ago' },
    { id: 'sig-2', category: 'income', label: 'RSU Vesting History', status: 'verified', detail: '2 years of vesting history confirmed. Used in qualifying income.', impact: 'medium', lastUpdated: '3 days ago' },
    { id: 'sig-3', category: 'income', label: 'Rental Income — 2BR Condo', status: 'action-needed', detail: 'Lease agreement and 12 months of bank deposit history required to count $1,500/mo in qualifying income.', actionLabel: 'Upload Lease + Statements', impact: 'high', lastUpdated: '—' },
    { id: 'sig-4', category: 'assets', label: 'Checking & Savings — Verified', status: 'verified', detail: 'Chase ($38.5K) and Ally HYSA ($94K) confirmed. 60-day history clean.', impact: 'high', lastUpdated: '1 day ago' },
    { id: 'sig-5', category: 'assets', label: 'Brokerage — Schwab', status: 'stale', detail: 'Last statement 47 days old. Underwriting requires <30-day recency for assets used in closing.', actionLabel: 'Refresh Statement', impact: 'medium', lastUpdated: '47 days ago' },
    { id: 'sig-6', category: 'assets', label: 'Large Deposit — $22,000', status: 'explaining', detail: 'Deposit on Apr 3 requires sourcing letter. Likely stock sale — confirm with brokerage statement.', actionLabel: 'Upload Source Doc', impact: 'high', lastUpdated: '—' },
    { id: 'sig-7', category: 'credit', label: 'Credit Score — 748', status: 'verified', detail: 'Very Good. Qualifies for best conventional pricing. No derogatory marks.', impact: 'high', lastUpdated: 'Today' },
    { id: 'sig-8', category: 'credit', label: 'DTI — 31% Back-End', status: 'verified', detail: 'Well within conventional limits (43% max). Front-end at 24%.', impact: 'high', lastUpdated: 'Today' },
    { id: 'sig-9', category: 'documentation', label: '2023 Federal Tax Return', status: 'verified', detail: 'Filed and uploaded. All schedules present.', impact: 'medium', lastUpdated: '2 days ago' },
    { id: 'sig-10', category: 'documentation', label: '2022 Federal Tax Return', status: 'action-needed', detail: 'Underwriting requires 2 years of tax returns. 2022 return not yet received.', actionLabel: 'Upload 2022 Return', impact: 'high', lastUpdated: '—' },
    { id: 'sig-11', category: 'identity', label: 'Government ID', status: 'verified', detail: 'Driver\'s license verified via secure upload.', impact: 'low', lastUpdated: '5 days ago' },
    { id: 'sig-12', category: 'identity', label: 'SSN Verification', status: 'verified', detail: 'SSN confirmed. OFAC/credit pull authorized.', impact: 'low', lastUpdated: '5 days ago' },
  ],
}

// ── Journey ────────────────────────────────────────────────────────────────────
export const MOCK_JOURNEY: JourneyPhase[] = [
  {
    id: 'ph-1', label: 'Home Search', sublabel: 'Finding your fit',
    status: 'complete', dateEstimate: 'Mar 1 – Mar 18', icon: 'Search',
    completedDate: 'Mar 18',
    subSteps: [
      { id: 'ss-1', label: 'Connected Jeremy.ai', done: true, date: 'Mar 1' },
      { id: 'ss-2', label: 'Financial profile built', done: true, date: 'Mar 3' },
      { id: 'ss-3', label: 'Buying power confirmed', done: true, date: 'Mar 5' },
      { id: 'ss-4', label: 'Target property identified', done: true, date: 'Mar 18' },
    ],
    insight: 'You toured 8 homes. Jeremy flagged 2 as financially superior to your favorites based on price-per-sqft and tax estimates.',
  },
  {
    id: 'ph-2', label: 'Pre-Approval', sublabel: 'Strengthening your offer',
    status: 'active', dateEstimate: 'Mar 18 – Mar 26', icon: 'ShieldCheck',
    subSteps: [
      { id: 'ss-5', label: 'Application submitted', done: true, date: 'Mar 18' },
      { id: 'ss-6', label: 'Income verified', done: true, date: 'Mar 19' },
      { id: 'ss-7', label: 'Assets verified', done: false },
      { id: 'ss-8', label: 'Rental income docs', done: false },
      { id: 'ss-9', label: 'Pre-approval letter issued', done: false },
    ],
    insight: 'Two open items are holding your pre-approval. Resolving them today puts you on track to make an offer by Thursday.',
  },
  {
    id: 'ph-3', label: 'Offer & Contract', sublabel: 'Winning the home',
    status: 'upcoming', dateEstimate: 'Est. Mar 27 – Apr 5', icon: 'FileSignature',
    subSteps: [
      { id: 'ss-10', label: 'Offer strategy review with Jeremy', done: false },
      { id: 'ss-11', label: 'Offer submitted', done: false },
      { id: 'ss-12', label: 'Negotiation complete', done: false },
      { id: 'ss-13', label: 'Contract executed', done: false },
      { id: 'ss-14', label: 'Earnest money deposited', done: false },
    ],
  },
  {
    id: 'ph-4', label: 'Inspection & Appraisal', sublabel: 'Confirming value',
    status: 'upcoming', dateEstimate: 'Est. Apr 6 – Apr 18', icon: 'ClipboardCheck',
    subSteps: [
      { id: 'ss-15', label: 'Home inspection scheduled', done: false },
      { id: 'ss-16', label: 'Inspection report reviewed', done: false },
      { id: 'ss-17', label: 'Appraisal ordered', done: false },
      { id: 'ss-18', label: 'Appraisal confirmed at value', done: false },
    ],
  },
  {
    id: 'ph-5', label: 'Underwriting', sublabel: 'Final approval',
    status: 'upcoming', dateEstimate: 'Est. Apr 18 – Apr 28', icon: 'Scale',
    subSteps: [
      { id: 'ss-19', label: 'File submitted to underwriting', done: false },
      { id: 'ss-20', label: 'Conditions issued', done: false },
      { id: 'ss-21', label: 'Conditions cleared', done: false },
      { id: 'ss-22', label: 'Clear to Close issued', done: false },
    ],
  },
  {
    id: 'ph-6', label: 'Closing', sublabel: 'Getting your keys',
    status: 'upcoming', dateEstimate: 'Est. Apr 30', icon: 'Key',
    subSteps: [
      { id: 'ss-23', label: 'Closing disclosure received', done: false },
      { id: 'ss-24', label: 'Final walkthrough', done: false },
      { id: 'ss-25', label: 'Wire funds', done: false },
      { id: 'ss-26', label: 'Deed recorded — you own it', done: false },
    ],
  },
]

// ── Buying Power ──────────────────────────────────────────────────────────────
export const MOCK_PRICE_BANDS: PriceBand[] = [
  {
    label: 'Comfortable Range',
    minPrice: 450000, maxPrice: 600000,
    monthlyPayment: 3200,
    qualifier: 'comfortable',
    description: 'Payment stays under 22% of gross monthly income. Full financial flexibility preserved.',
  },
  {
    label: 'Recommended Max',
    minPrice: 600000, maxPrice: 720000,
    monthlyPayment: 4100,
    qualifier: 'stretch',
    description: 'Payment reaches 28% of gross income. Achievable but reduces discretionary savings.',
  },
  {
    label: 'Absolute Ceiling',
    minPrice: 720000, maxPrice: 820000,
    monthlyPayment: 4900,
    qualifier: 'risk',
    description: 'Approaches 36% DTI threshold. Requires minimal new debt and full asset documentation.',
  },
]

export const MOCK_STRESS_SCENARIOS: StressScenario[] = [
  { label: 'Rate +1%', delta: '+1% rate increase', originalPayment: 4150, stressedPayment: 4598, impact: 'medium' },
  { label: 'Taxes +20%', delta: 'Property taxes rise 20%', originalPayment: 4150, stressedPayment: 4424, impact: 'low' },
  { label: 'Insurance +30%', delta: 'Insurance premium up 30%', originalPayment: 4150, stressedPayment: 4203, impact: 'low' },
  { label: 'Combo Stress', delta: 'All three scenarios', originalPayment: 4150, stressedPayment: 5075, impact: 'high' },
]

// ── Advisor Clients — 12 Borrower Groups across all close windows ─────────────
export const MOCK_CLIENTS: ClientData[] = [

  // ════ IN CLOSING (0–14 days) ════════════════════════════════════════════════

  {
    id: 'cli-1', name: 'Tom & Lisa Barrett', initials: 'TB', groupType: 'couple',
    borrowers: [
      { name: 'Tom Barrett',  initials: 'TB', role: 'primary',     occupation: 'Engineer — Dell' },
      { name: 'Lisa Barrett', initials: 'LB', role: 'co-borrower', occupation: 'Teacher — Austin ISD' },
    ],
    targetPrice: 750_000, loanAmount: 600_000,
    readinessScore: 87, conversionProbability: 91,
    riskSignals: ['Lisa W-2 not yet received'],
    riskLevel: 'low', lastActivity: '45 min ago',
    nextBestAction: 'Call Lisa\'s HR at Austin ISD directly. One W-2 from full underwriting submission — file is otherwise clean.',
    pricingOpportunity: false,
    stage: 'ready', closeWindow: 'closing', daysToClose: 8, rateLockExpiry: 'Mar 29, 2026',
  },
  {
    id: 'cli-2', name: 'David & Emma Chen', initials: 'DC', groupType: 'couple',
    borrowers: [
      { name: 'David Chen', initials: 'DC', role: 'primary',     occupation: 'Software Architect — Salesforce' },
      { name: 'Emma Chen',  initials: 'EC', role: 'co-borrower', occupation: 'Marketing Director — HubSpot' },
    ],
    targetPrice: 520_000, loanAmount: 416_000,
    readinessScore: 94, conversionProbability: 97,
    riskSignals: [],
    riskLevel: 'low', lastActivity: '1 hour ago',
    nextBestAction: 'All conditions cleared. Issue final approval and coordinate closing date with Phoenix Title.',
    pricingOpportunity: false,
    stage: 'ready', closeWindow: 'closing', daysToClose: 12,
  },

  // ════ 30 DAYS (15–30 days) ══════════════════════════════════════════════════

  {
    id: 'cli-3', name: 'John & Sarah Smith', initials: 'JS', groupType: 'couple',
    borrowers: [
      { name: 'John Smith',  initials: 'JS', role: 'primary',     occupation: 'Tech Entrepreneur' },
      { name: 'Sarah Smith', initials: 'SS', role: 'co-borrower', occupation: 'Physician — Kaiser' },
    ],
    targetPrice: 1_300_000, loanAmount: 1_023_000,
    readinessScore: 78, conversionProbability: 84,
    riskSignals: ['Self-employment 2yr avg needed', 'Deposit explanation pending'],
    riskLevel: 'medium', lastActivity: '2 hours ago',
    nextBestAction: 'Get 2022–2023 tax returns for self-employment avg. Deposit sourcing letter clears the last UW flag.',
    pricingOpportunity: true, pricingOpportunityDetail: 'Confirming rental income moves jumbo rate tier — saves $310/mo',
    stage: 'analyzing', closeWindow: '30', daysToClose: 18, rateLockExpiry: 'Apr 8, 2026',
  },
  {
    id: 'cli-4', name: 'Wei & Mei Lin', initials: 'WL', groupType: 'couple',
    borrowers: [
      { name: 'Wei Lin', initials: 'WL', role: 'primary',     occupation: 'Senior SWE — Amazon' },
      { name: 'Mei Lin', initials: 'ML', role: 'co-borrower', occupation: 'Product Manager — Amazon' },
    ],
    targetPrice: 890_000, loanAmount: 712_000,
    readinessScore: 89, conversionProbability: 88,
    riskSignals: ['RSU continuance confirmation needed'],
    riskLevel: 'low', lastActivity: '4 hours ago',
    nextBestAction: 'Request Amazon HR continuance letter for RSU income. Strong vesting history — one letter, approvable.',
    pricingOpportunity: true, pricingOpportunityDetail: 'RSU letter unlocks preferred rate — saves $78/mo',
    stage: 'analyzing', closeWindow: '30', daysToClose: 22,
  },
  {
    id: 'cli-5', name: 'Kevin & Amanda Foster', initials: 'KF', groupType: 'couple',
    borrowers: [
      { name: 'Kevin Foster',  initials: 'KF', role: 'primary',     occupation: 'Nurse Manager — Vanderbilt' },
      { name: 'Amanda Foster', initials: 'AF', role: 'co-borrower', occupation: 'Teacher — Metro Nashville' },
    ],
    targetPrice: 480_000, loanAmount: 432_000,
    readinessScore: 82, conversionProbability: 79,
    riskSignals: ['Appraisal still pending'],
    riskLevel: 'low', lastActivity: '6 hours ago',
    nextBestAction: 'Rush appraisal order — 28-day window is tight. Income, assets, credit all submission-ready.',
    pricingOpportunity: false,
    stage: 'analyzing', closeWindow: '30', daysToClose: 28,
  },

  // ════ 60 DAYS (31–60 days) ══════════════════════════════════════════════════

  {
    id: 'cli-6', name: 'Marcus & Priya Williams', initials: 'MW', groupType: 'couple',
    borrowers: [
      { name: 'Marcus Williams', initials: 'MW', role: 'primary',     occupation: 'General Contractor — Self-Employed' },
      { name: 'Priya Williams',  initials: 'PW', role: 'co-borrower', occupation: 'Nurse Practitioner — UCHealth' },
    ],
    targetPrice: 950_000, loanAmount: 760_000,
    readinessScore: 61, conversionProbability: 58,
    riskSignals: ['Self-employment income YOY variance', 'Credit utilization 67%', 'Thin tradeline history'],
    riskLevel: 'high', lastActivity: '1 day ago',
    nextBestAction: 'Income review call — qualifying income $38K below stated. Paying 2 cards drops utilization and may recover 18 credit points.',
    pricingOpportunity: false,
    stage: 'analyzing', closeWindow: '60', daysToClose: 45,
  },
  {
    id: 'cli-7', name: 'Amir & Fatima Hassan', initials: 'AH', groupType: 'couple',
    borrowers: [
      { name: 'Amir Hassan',   initials: 'AH', role: 'primary',     occupation: 'Physician — Baylor Scott & White' },
      { name: 'Fatima Hassan', initials: 'FH', role: 'co-borrower', occupation: 'Dentist — Partnership Practice' },
    ],
    targetPrice: 680_000, loanAmount: 544_000,
    readinessScore: 71, conversionProbability: 73,
    riskSignals: ['Non-US citizen (H-1B) — additional docs', 'Fatima K-1 partnership income needed'],
    riskLevel: 'medium', lastActivity: '2 days ago',
    nextBestAction: 'Request H-1B visa + employment authorization from Baylor. Fatima K-1 last 2 years for partnership income.',
    pricingOpportunity: false,
    stage: 'analyzing', closeWindow: '60', daysToClose: 50,
  },
  {
    id: 'cli-8', name: 'Ramirez & Park Families', initials: 'CR', groupType: 'joint-purchase',
    propertyContext: 'Beach Condo · Malibu, CA',
    borrowers: [
      { name: 'Carlos Ramirez', initials: 'CR', role: 'primary',     occupation: 'Dentist — Private Practice' },
      { name: 'Sofia Ramirez',  initials: 'SR', role: 'co-borrower', occupation: 'VP Finance — Paramount' },
      { name: 'James Park',     initials: 'JP', role: 'primary',     occupation: 'Staff Engineer — Google' },
      { name: 'Mia Park',       initials: 'MP', role: 'co-borrower', occupation: 'Principal Architect' },
    ],
    targetPrice: 1_200_000, loanAmount: 900_000,
    readinessScore: 72, conversionProbability: 67,
    riskSignals: ['4-borrower UW complexity', 'LLC vs. personal title unresolved', 'Mia 1099 income verification needed'],
    riskLevel: 'medium', lastActivity: '3 hours ago',
    nextBestAction: 'Schedule all-4-borrower consult. Recommend LLC. Carlos & Sofia lead qualification; James & Mia as co-borrowers.',
    pricingOpportunity: true, pricingOpportunityDetail: '2nd home (not investment) saves 0.75% — $540/mo',
    stage: 'prospect', closeWindow: '60', daysToClose: 55,
  },

  // ════ 90+ DAYS (61+ days) ════════════════════════════════════════════════════

  {
    id: 'cli-9', name: 'Jordan & Alex Reyes', initials: 'JR', groupType: 'couple',
    borrowers: [
      { name: 'Jordan Reyes', initials: 'JR', role: 'primary',     occupation: 'Teacher — Charlotte-Mecklenburg' },
      { name: 'Alex Reyes',   initials: 'AR', role: 'co-borrower', occupation: 'Engineer — Startup (8 months)' },
    ],
    targetPrice: 395_000, loanAmount: 375_000,
    readinessScore: 63, conversionProbability: 52,
    riskSignals: ['Alex employment < 12 months', 'Startup equity not qualifying income', 'Reserves < 2 months'],
    riskLevel: 'high', lastActivity: '1 day ago',
    nextBestAction: 'Jordan qualifies solo at 70% of target. Restructure as single-borrower if Alex can\'t reach 12-month mark before closing.',
    pricingOpportunity: false,
    stage: 'analyzing', closeWindow: '90+', daysToClose: 72,
  },
  {
    id: 'cli-10', name: 'Robert & Christine Kim', initials: 'RK', groupType: 'couple',
    borrowers: [
      { name: 'Robert Kim',    initials: 'RK', role: 'primary',     occupation: 'Surgeon — Mass General' },
      { name: 'Christine Kim', initials: 'CK', role: 'co-borrower', occupation: 'Financial Advisor — Fidelity' },
    ],
    targetPrice: 1_050_000, loanAmount: 840_000,
    readinessScore: 85, conversionProbability: 76,
    riskSignals: ['Existing primary mortgage affects DTI', '2nd home vs. investment TBD'],
    riskLevel: 'medium', lastActivity: '2 days ago',
    nextBestAction: 'Confirm 2nd home occupancy intent — 0.75% rate difference. Robert confirms personal use 3+ months/yr.',
    pricingOpportunity: true, pricingOpportunityDetail: 'Physician employment letter may unlock jumbo pricing tier',
    stage: 'prospect', closeWindow: '90+', daysToClose: 78,
  },
  {
    id: 'cli-11', name: 'Carlos & Maria Martinez', initials: 'CM', groupType: 'couple',
    borrowers: [
      { name: 'Carlos Martinez', initials: 'CM', role: 'primary',     occupation: 'HVAC Business Owner' },
      { name: 'Maria Martinez',  initials: 'MM', role: 'co-borrower', occupation: 'Admin — parental leave' },
    ],
    targetPrice: 555_000, loanAmount: 444_000,
    readinessScore: 69, conversionProbability: 61,
    riskSignals: ['Maria on parental leave — income gap', 'Carlos self-employment 2yr avg needed', 'Reserves borderline (3 months)'],
    riskLevel: 'medium', lastActivity: '3 days ago',
    nextBestAction: 'Document Maria\'s return-to-work date. If within 60 days of closing, income may still qualify. Get Carlos 2yr business returns.',
    pricingOpportunity: false,
    stage: 'analyzing', closeWindow: '90+', daysToClose: 85,
  },
  {
    id: 'cli-12', name: 'Priya & Raj Sharma', initials: 'PS', groupType: 'couple',
    borrowers: [
      { name: 'Priya Sharma', initials: 'PS', role: 'primary',     occupation: 'Engineer — NVIDIA' },
      { name: 'Raj Sharma',   initials: 'RS', role: 'co-borrower', occupation: 'Engineer — Meta' },
    ],
    targetPrice: 875_000, loanAmount: 700_000,
    readinessScore: 55, conversionProbability: 44,
    riskSignals: ['Student loan DTI at 41%', 'Down payment only 8% — PMI applies', 'Insufficient liquid savings'],
    riskLevel: 'high', lastActivity: '3 days ago',
    nextBestAction: 'Very high income, low liquid assets. Direct $8K/mo to HYSA for 90 days. Re-engage in June.',
    pricingOpportunity: false,
    stage: 'prospect', closeWindow: '90+', daysToClose: 92,
  },
]

export const MOCK_ADVISOR_METRICS: AdvisorMetrics = {
  activeClients: 12,
  avgReadiness: 76,
  closingsThisMonth: 2,
  pipelineValue: 7_746_000,
  avgConversionProb: 73,
}

export const MOCK_INSIGHT_EVENTS: InsightEvent[] = [
  { id: 'ev-1',  clientName: 'Tom & Lisa Barrett',      eventType: 'conversion_ready',    message: 'Rate lock Mar 29 — 8 days out. Lisa W-2 still outstanding. Call Austin ISD HR now.', timestamp: '45 min ago',  urgency: 'high' },
  { id: 'ev-2',  clientName: 'David & Emma Chen',       eventType: 'conversion_ready',    message: 'All conditions cleared. Closing in 12 days. Issue final approval today.', timestamp: '1 hour ago',   urgency: 'high' },
  { id: 'ev-3',  clientName: 'John & Sarah Smith',      eventType: 'pricing_opportunity', message: 'Rental income confirmed. Jumbo rate tier improves — saves $310/mo over life of loan.', timestamp: '2 hours ago',  urgency: 'high' },
  { id: 'ev-4',  clientName: 'Ramirez & Park Families', eventType: 'signal_change',       message: 'Mia Park uploaded 1099s. 4-borrower consult still needed before ownership structure set.', timestamp: '3 hours ago',  urgency: 'medium' },
  { id: 'ev-5',  clientName: 'Wei & Mei Lin',           eventType: 'pricing_opportunity', message: 'Amazon HR RSU letter received. Rate tier confirmed — ready to lock.', timestamp: '4 hours ago',  urgency: 'medium' },
  { id: 'ev-6',  clientName: 'Marcus & Priya Williams', eventType: 'risk_alert',          message: 'AUS flagged income variance. Manual review required — qualifying income $38K below stated.', timestamp: '1 day ago',    urgency: 'high' },
  { id: 'ev-7',  clientName: 'Jordan & Alex Reyes',     eventType: 'risk_alert',          message: 'Alex at 8-month employment mark. Solo application from Jordan may be the path forward.', timestamp: '1 day ago',    urgency: 'high' },
  { id: 'ev-8',  clientName: 'Amir & Fatima Hassan',    eventType: 'document_added',      message: 'Amir H-1B visa received. Employment authorization letter from Baylor still needed.', timestamp: '2 days ago',   urgency: 'medium' },
  { id: 'ev-9',  clientName: 'Robert & Christine Kim',  eventType: 'pricing_opportunity', message: '2nd home classification confirmed. Saves 0.75% vs. investment rate — $420/mo.', timestamp: '2 days ago',   urgency: 'low' },
  { id: 'ev-10', clientName: 'Priya & Raj Sharma',      eventType: 'risk_alert',          message: 'Insufficient reserves. 90-day savings plan recommended before file moves forward.', timestamp: '3 days ago',   urgency: 'medium' },
]

// ── Homeowner ──────────────────────────────────────────────────────────────────
export const MOCK_HOMEOWNER: HomeownerData = {
  purchasePrice: 685000,
  purchaseDate: 'Apr 30, 2024',
  currentValue: 726000,
  loanBalance: 598200,
  originalRate: 6.625,
  currentMarketRate: 5.875,
  monthlyPayment: 4418,
  termYears: 30,
  totalEquity: 127800,
  equityPct: 18,
  ltv: 82,
  yearsRemaining: 29.1,
  monthlyPotentialSavings: 312,
  extraPaymentYearsSaved: 4.3,
  equityHistory: generateEquityHistory(685000, 6.625, 30, 0.04),
  maintenanceEvents: [
    { id: 'me-1', month: 3, label: 'HVAC Filter Replacement', category: 'hvac', estimatedCost: 40, status: 'done' },
    { id: 'me-2', month: 4, label: 'Annual HVAC Tune-Up', category: 'hvac', estimatedCost: 180, status: 'upcoming' },
    { id: 'me-3', month: 5, label: 'Gutter Cleaning', category: 'general', estimatedCost: 200, status: 'upcoming' },
    { id: 'me-4', month: 6, label: 'Irrigation System Check', category: 'landscaping', estimatedCost: 150, status: 'upcoming' },
    { id: 'me-5', month: 9, label: 'Roof Inspection', category: 'roof', estimatedCost: 300, status: 'upcoming' },
    { id: 'me-6', month: 10, label: 'Water Heater Flush', category: 'plumbing', estimatedCost: 80, status: 'upcoming' },
    { id: 'me-7', month: 11, label: 'Furnace Pre-Season Check', category: 'hvac', estimatedCost: 160, status: 'upcoming' },
    { id: 'me-8', month: 12, label: 'Year-End Home Inspection', category: 'general', estimatedCost: 450, status: 'upcoming' },
  ],
}
