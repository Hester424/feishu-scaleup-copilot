"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  AnalysisResult,
  ExpertValidation,
  HistoricalCase,
  InvestigationInput,
  RetrievedCase,
} from "./types";
import { KNOWLEDGE_BASE, nextCaseId } from "./knowledgeBase";

interface InvestigationState {
  input: InvestigationInput | null;
  retrievedCases: RetrievedCase[];
  analysis: AnalysisResult | null;
  validation: ExpertValidation | null;
  /** Live case pool for this session: the seed knowledge base plus any
   * cases added via Upload, the Case Library, or a confirmed Expert
   * Validation. This is what retrieval actually searches over — so a case
   * added mid-session is retrievable by the very next investigation. */
  cases: HistoricalCase[];
  setInput: (input: InvestigationInput) => void;
  setRetrievedCases: (cases: RetrievedCase[]) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  setValidation: (validation: ExpertValidation) => void;
  /** Adds a new case to the shared pool, auto-assigning the next sequential
   * ID. Returns the case as stored (with its final id). */
  addCase: (
    draft: Omit<HistoricalCase, "id" | "isUserAdded" | "addedAt">
  ) => HistoricalCase;
  reset: () => void;
}

const InvestigationContext = createContext<InvestigationState | null>(null);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<InvestigationInput | null>(null);
  const [retrievedCases, setRetrievedCases] = useState<RetrievedCase[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [validation, setValidation] = useState<ExpertValidation | null>(null);
  const [cases, setCases] = useState<HistoricalCase[]>(KNOWLEDGE_BASE);

  const addCase = useCallback(
    (draft: Omit<HistoricalCase, "id" | "isUserAdded" | "addedAt">) => {
      // Computed directly from the current `cases` closure, not from inside
      // the setCases updater — React doesn't guarantee a functional updater
      // runs synchronously before this function returns, so assigning to an
      // outer variable from inside one (as a previous version of this code
      // did) can return a stale/undefined value to the caller.
      const created: HistoricalCase = {
        ...draft,
        id: nextCaseId(cases),
        isUserAdded: true,
        addedAt: new Date().toISOString(),
      };
      setCases((prev) => [...prev, created]);
      return created;
    },
    [cases]
  );

  const value = useMemo<InvestigationState>(
    () => ({
      input,
      retrievedCases,
      analysis,
      validation,
      cases,
      setInput,
      setRetrievedCases,
      setAnalysis,
      setValidation,
      addCase,
      reset: () => {
        setInput(null);
        setRetrievedCases([]);
        setAnalysis(null);
        setValidation(null);
      },
    }),
    [input, retrievedCases, analysis, validation, cases, addCase]
  );

  return (
    <InvestigationContext.Provider value={value}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const ctx = useContext(InvestigationContext);
  if (!ctx) {
    throw new Error(
      "useInvestigation must be used within an InvestigationProvider"
    );
  }
  return ctx;
}
