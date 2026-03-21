// ── Property / Listing ──────────────────────────────────────────────────────
export type PropertyType = 'single_family' | 'condo' | 'townhouse' | 'multi_family'

export interface PropertyData {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  lotSqft?: number
  type: PropertyType
  yearBuilt: number
  daysOnMarket: number
  pricePerSqft: number
  hoa?: number
  estimatedTaxes: number
  estimatedInsurance: number
  tags: string[]
  gradient: string // tailwind gradient classes for photo mock
  photo?: string   // Unsplash URL for listing image
  goalInsight?: string // Jeremy's personalised goal-alignment line
}

// ── Financial Profile ────────────────────────────────────────────────────────
export interface IncomeSource {
  id: string
  label: string
  type: 'salary' | 'self_employed' | 'rental' | 'investment' | 'other'
  annual: number
  verified: boolean
}

export interface AssetItem {
  id: string
  label: string
  type: 'checking' | 'savings' | 'investment' | 'retirement' | 'other'
  value: number
  liquid: boolean
}

export interface DebtItem {
  id: string
  label: string
  type: 'mortgage' | 'auto' | 'student' | 'credit_card' | 'personal' | 'other'
  balance: number
  monthlyPayment: number
  rate: number
}

export interface ProfileData {
  name: string
  initials: string
  creditScore: number
  creditBand: 'exceptional' | 'very_good' | 'good' | 'fair' | 'poor'
  income: IncomeSource[]
  assets: AssetItem[]
  debts: DebtItem[]
  confidence: number           // 0–100
  missingSignals: string[]
  buyingPowerMin: number
  buyingPowerMax: number
  frontDTI: number             // % housing costs / gross income
  backDTI: number              // % total debt / gross income
}

// ── Scenarios ────────────────────────────────────────────────────────────────
export type LoanType = 'conventional' | 'fha' | 'va' | 'arm'
export type StrategyType = 'conservative' | 'balanced' | 'optimized'

export interface ScenarioData {
  id: string
  label: string
  strategyType: StrategyType
  loanType: LoanType
  termYears: 15 | 20 | 30
  rate: number
  downPercent: number
  homePrice: number
  loanAmount: number
  monthlyPayment: number       // P&I only
  totalMonthly: number         // P&I + taxes + insurance + PMI
  pmi: number
  cashToClose: number
  totalInterest: number
  totalCost: number            // principal + interest + taxes + insurance over life
  isRecommended: boolean
  insight: string
}

export interface AmortizationPoint {
  year: number
  principal: number
  interest: number
  balance: number
  totalPaid: number
}

// ── Readiness ────────────────────────────────────────────────────────────────
export type SignalStatus = 'verified' | 'stale' | 'action-needed' | 'explaining'

export interface ReadinessSignal {
  id: string
  category: 'income' | 'assets' | 'credit' | 'documentation' | 'identity'
  label: string
  status: SignalStatus
  detail: string
  actionLabel?: string
  lastUpdated?: string
  impact: 'high' | 'medium' | 'low'
}

export interface ReadinessData {
  score: number                // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  daysToReady: number
  signals: ReadinessSignal[]
  readinessInsight: string
}

// ── Journey ──────────────────────────────────────────────────────────────────
export type PhaseStatus = 'complete' | 'active' | 'upcoming'

export interface SubStep {
  id: string
  label: string
  done: boolean
  date?: string
}

export interface JourneyPhase {
  id: string
  label: string
  sublabel: string
  status: PhaseStatus
  dateEstimate: string
  icon: string                 // lucide icon name
  subSteps: SubStep[]
  insight?: string
  completedDate?: string
}

// ── Buying Power ─────────────────────────────────────────────────────────────
export interface PriceBand {
  label: string
  minPrice: number
  maxPrice: number
  monthlyPayment: number
  qualifier: 'comfortable' | 'stretch' | 'risk'
  description: string
}

export interface StressScenario {
  label: string
  delta: string
  originalPayment: number
  stressedPayment: number
  impact: 'low' | 'medium' | 'high'
}

// ── Advisor ──────────────────────────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface BorrowerMember {
  name: string
  initials: string
  role: 'primary' | 'co-borrower'
  occupation?: string
}

export type CloseWindow = 'closing' | '30' | '60' | '90+'

export interface ClientData {
  id: string
  name: string                   // group display name e.g. "Smith Family"
  initials: string               // primary borrower initials for compact views
  borrowers: BorrowerMember[]    // all co-borrowers on the loan
  groupType: 'individual' | 'couple' | 'joint-purchase'
  propertyContext?: string       // e.g. "Beach Condo · Malibu, CA"
  targetPrice: number
  readinessScore: number
  conversionProbability: number  // 0–100
  riskSignals: string[]
  riskLevel: RiskLevel
  lastActivity: string
  nextBestAction: string
  pricingOpportunity: boolean
  pricingOpportunityDetail?: string
  stage: 'prospect' | 'analyzing' | 'ready' | 'closed'
  loanAmount: number
  closeWindow: CloseWindow       // time-to-close bucket for pipeline segmentation
  daysToClose: number            // estimated days until closing
  rateLockExpiry?: string        // e.g. "Mar 29, 2026" — surfaces urgency
}

export interface AdvisorMetrics {
  activeClients: number
  avgReadiness: number
  closingsThisMonth: number
  pipelineValue: number
  avgConversionProb: number
}

export interface InsightEvent {
  id: string
  clientName: string
  eventType: 'signal_change' | 'pricing_opportunity' | 'risk_alert' | 'conversion_ready' | 'document_added'
  message: string
  timestamp: string
  urgency: 'low' | 'medium' | 'high'
}

// ── Homeowner ────────────────────────────────────────────────────────────────
export interface EquityPoint {
  month: number                // months since close
  label: string                // "Month 0", "Year 1", etc.
  homeValue: number
  loanBalance: number
  equity: number
  equityPct: number
}

export interface MaintenanceEvent {
  id: string
  month: number                // 1–12
  label: string
  category: 'hvac' | 'plumbing' | 'roof' | 'landscaping' | 'electrical' | 'general'
  estimatedCost: number
  status: 'upcoming' | 'due' | 'done'
}

export interface HomeownerData {
  purchasePrice: number
  purchaseDate: string
  currentValue: number
  loanBalance: number
  originalRate: number
  currentMarketRate: number
  monthlyPayment: number
  termYears: number
  totalEquity: number
  equityPct: number
  ltv: number
  yearsRemaining: number
  equityHistory: EquityPoint[]
  maintenanceEvents: MaintenanceEvent[]
  monthlyPotentialSavings: number    // if refinanced today
  extraPaymentYearsSaved: number     // if +$200/mo extra payment
}
