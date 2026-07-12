"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  AnalysisResult,
  ExpertValidation,
  InvestigationInput,
  RetrievedCase,
} from "./types";

interface InvestigationState {
  input: InvestigationInput | null;
  retrievedCases: RetrievedCase[];
  analysis: AnalysisResult | null;
  validation: ExpertValidation | null;
  setInput: (input: InvestigationInput) => void;
  setRetrievedCases: (cases: RetrievedCase[]) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  setValidation: (validation: ExpertValidation) => void;
  reset: () => void;
}

const InvestigationContext = createContext<InvestigationState | null>(null);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<InvestigationInput | null>(null);
  const [retrievedCases, setRetrievedCases] = useState<RetrievedCase[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [validation, setValidation] = useState<ExpertValidation | null>(null);

  const value = useMemo<InvestigationState>(
    () => ({
      input,
      retrievedCases,
      analysis,
      validation,
      setInput,
      setRetrievedCases,
      setAnalysis,
      setValidation,
      reset: () => {
        setInput(null);
        setRetrievedCases([]);
        setAnalysis(null);
        setValidation(null);
      },
    }),
    [input, retrievedCases, analysis, validation]
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
