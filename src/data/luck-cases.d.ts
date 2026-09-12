// Type declarations for luck-cases.mjs — sibling .d.ts so the plain JS
// module is importable by both Astro/Vite and standalone Node scripts.

export type LuckForm = "structural" | "encounter" | "event" | "variance";

export type LuckSource = { label: string; url: string };

export type LuckCase = {
  id: string;
  title: string;
  subtitle: string;
  form: LuckForm;
  period: string;
  category: string;
  figure: string;
  figureLabel: string;
  summary: string;
  theSetup: string;
  theLuck: string;
  theNumbers: string[];
  boundary: string;
  sources: LuckSource[];
};

export declare const LUCK_FORM_LABELS: Record<LuckForm, string>;
export declare const LUCK_FORM_SUMMARIES: Record<LuckForm, string>;
export declare const LUCK_FORM_ORDER: LuckForm[];
export declare const luckCases: LuckCase[];
export declare const luckCaseById: Record<string, LuckCase>;
