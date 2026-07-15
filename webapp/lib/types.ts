export type Stage = "Lab" | "Pilot" | "Commercial";

export type DocType =
  | "Deviation Report"
  | "Batch Record"
  | "CAPA"
  | "Change Control";

export interface InvestigationInput {
  product: string;
  synthesisRoute: string;
  currentStage: Stage;
  scale: string;
  equipment: string;
  targetYield: string;
  problemDescription: string;
  /** Optional structured step-type tags selected via chips on Page 1,
   * e.g. ["fluorination"]. These are unioned with the free-text keyword
   * extraction so retrieval doesn't depend entirely on regex-matching
   * whatever wording the user happens to type. */
  suspectedStepTags?: string[];
}

export interface HistoricalCase {
  id: string;
  docType: DocType;
  productType: string;
  stage: Stage;
  scale: string;
  scenario: string;
  rootCause: string;
  resolution: string;
  outcome: string;
  keyParameters: Record<string, string>;
  tags: string[];
  /** Optional diagnostic pitfall note — e.g. "this case's symptoms look like
   * another case's, but the confirmed root cause is different." Surfaced as
   * a prominent callout in the UI (not just buried in the data) so it's
   * legible at a glance that retrieval is doing more than keyword matching. */
  caveat?: string;
  /** True for cases added during this session (via Upload or Expert
   * Validation), as opposed to the seed knowledge base. Used to badge new
   * entries in the Case Library. */
  isUserAdded?: boolean;
  /** ISO timestamp for user-added cases. */
  addedAt?: string;
}

export interface RetrievedCase extends HistoricalCase {
  relevanceScore: number;
  matchedTags: string[];
  relevanceExplanation: string;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface KeyDifference {
  aspect: string;
  current: string;
  historical: string;
  /** true = condition matches / transfers cleanly; false = mismatch, transfer with caution. */
  matched: boolean;
  sourceCaseId: string;
  note: string;
}

export interface TransferableLesson {
  lesson: string;
  applicable: boolean;
  reason: string;
  sourceCaseId: string;
}

export interface RecommendedAction {
  action: string;
  rationale: string;
  relatedCaseIds: string[];
}

export interface RiskItem {
  risk: string;
  likelihood: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  rationale: string;
  sourceCaseId?: string;
}

export interface ScenarioAnalysisItem {
  sourceCaseId: string;
  historicalCondition: string;
  historicalOutcome: string;
  note: string;
}

export interface CaseAttribution {
  caseId: string;
  /** Why this specific case surfaced as relevant to the current scenario. */
  whyRelevant: string;
  /** Success/failure attribution for the historical case itself. */
  attribution: string;
}

export interface AnalysisResult {
  attributions: CaseAttribution[];
  keyDifferences: KeyDifference[];
  transferableLessons: TransferableLesson[];
  recommendedActions: RecommendedAction[];
  risks: RiskItem[];
  scenarioAnalysis: ScenarioAnalysisItem[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
  blindSpots: string[];
  summary: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  servedFromCache?: boolean;
}

export type ValidationDecision = "confirmed" | "revised" | "supplemented";

export interface ExpertValidation {
  decision: ValidationDecision;
  comment: string;
  validatedBy: string;
  validatedAt: string;
}
