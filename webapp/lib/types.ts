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
  note: string;
}

export interface TransferableLesson {
  lesson: string;
  applicable: boolean;
  reason: string;
  sourceCaseId: string;
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
  attribution: string;
}

export interface AnalysisResult {
  attributions: CaseAttribution[];
  keyDifferences: KeyDifference[];
  transferableLessons: TransferableLesson[];
  risks: RiskItem[];
  scenarioAnalysis: ScenarioAnalysisItem[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
  blindSpots: string[];
  summary: string;
  usedFallback?: boolean;
  fallbackReason?: string;
}

export type ValidationDecision = "confirmed" | "revised" | "supplemented";

export interface ExpertValidation {
  decision: ValidationDecision;
  comment: string;
  validatedBy: string;
  validatedAt: string;
}
