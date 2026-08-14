export const EFFORT_STAGES = [
  {
    key: "foundation",
    label: "Foundation",
    description: "Prerequisites, access, runway, tools, and getting into position.",
  },
  {
    key: "capability",
    label: "Capability-building",
    description: "Developing skills or converting access into usable leverage.",
  },
  {
    key: "final-mile",
    label: "Final mile",
    description: "Effort applied directly to producing the evaluated outcome.",
  },
] as const;

const INVESTMENT_KINDS = ["time", "money", "resource"] as const;

export type EffortStage = (typeof EFFORT_STAGES)[number]["key"];
export type InvestmentKind = (typeof INVESTMENT_KINDS)[number];

export type InvestmentItem = {
  label: string;
  kind: InvestmentKind;
  stage: EffortStage | "";
  quantity: number;
  valuePerUnit: number;
};

export type Outcome = {
  label: string;
  probability: number;
  value: number;
};

type ValidationIssue = {
  scope: "investment" | "outcome" | "distribution";
  index?: number;
  field?: "label" | "stage" | "quantity" | "valuePerUnit" | "probability" | "value";
  message: string;
};

type InvestmentSubtotal = InvestmentItem & {
  subtotal: number;
};

type OutcomeContribution = Outcome & {
  contribution: number;
};

type StageAllocation = {
  key: EffortStage;
  label: string;
  description: string;
  value: number;
  share: number;
};

type RoiResult = {
  expectedGrossValue: number;
  expectedNetReturn: number;
  expectedRoi: number;
  expectedMultiple: number;
  downsideProbability: number;
  breakEvenProbability: number;
  worstOutcomeValue: number;
  bestOutcomeValue: number;
};

export type RoiSummary = {
  investmentItems: InvestmentSubtotal[];
  outcomeContributions: OutcomeContribution[];
  totalInvestment: number;
  probabilityTotal: number;
  probabilityGap: number;
  probabilityComplete: boolean;
  stageAllocations: StageAllocation[];
  issues: ValidationIssue[];
  result: RoiResult | null;
};

const PROBABILITY_TOLERANCE = 0.01;

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

function investmentIssues(items: InvestmentItem[]) {
  const issues: ValidationIssue[] = [];
  if (items.length === 0) {
    issues.push({
      scope: "investment",
      message: "Add at least one investment item.",
    });
  }

  items.forEach((item, index) => {
    if (!item.label.trim()) {
      issues.push({
        scope: "investment",
        index,
        field: "label",
        message: "Name this investment.",
      });
    }
    if (!item.stage) {
      issues.push({
        scope: "investment",
        index,
        field: "stage",
        message: "Choose where this valued investment lands.",
      });
    }
    if (!isFiniteNumber(item.quantity) || item.quantity < 0) {
      issues.push({
        scope: "investment",
        index,
        field: "quantity",
        message: "Quantity must be zero or greater.",
      });
    }
    if (!isFiniteNumber(item.valuePerUnit) || item.valuePerUnit < 0) {
      issues.push({
        scope: "investment",
        index,
        field: "valuePerUnit",
        message: "Value per unit must be zero or greater.",
      });
    }
  });
  return issues;
}

function outcomeIssues(outcomes: Outcome[]) {
  const issues: ValidationIssue[] = [];
  if (outcomes.length === 0) {
    issues.push({ scope: "outcome", message: "Add at least one possible outcome." });
  }

  outcomes.forEach((outcome, index) => {
    if (!outcome.label.trim()) {
      issues.push({
        scope: "outcome",
        index,
        field: "label",
        message: "Name this outcome.",
      });
    }
    if (
      !isFiniteNumber(outcome.probability) ||
      outcome.probability < 0 ||
      outcome.probability > 100
    ) {
      issues.push({
        scope: "outcome",
        index,
        field: "probability",
        message: "Probability must be between 0% and 100%.",
      });
    }
    if (!isFiniteNumber(outcome.value)) {
      issues.push({
        scope: "outcome",
        index,
        field: "value",
        message: "Outcome value must be a finite number.",
      });
    }
  });
  return issues;
}

function buildRoiResult(
  contributions: OutcomeContribution[],
  outcomes: Outcome[],
  totalInvestment: number,
): RoiResult {
  const expectedGrossValue = contributions.reduce(
    (sum, outcome) => sum + outcome.contribution,
    0,
  );
  const expectedNetReturn = expectedGrossValue - totalInvestment;
  const values = outcomes.map((outcome) => outcome.value);
  const probabilityWhere = (predicate: (outcome: Outcome) => boolean) =>
    outcomes
      .filter(predicate)
      .reduce((sum, outcome) => sum + outcome.probability, 0);
  return {
    expectedGrossValue,
    expectedNetReturn,
    expectedRoi: (expectedNetReturn / totalInvestment) * 100,
    expectedMultiple: expectedGrossValue / totalInvestment,
    downsideProbability: probabilityWhere((outcome) => outcome.value < totalInvestment),
    breakEvenProbability: probabilityWhere((outcome) => outcome.value >= totalInvestment),
    worstOutcomeValue: Math.min(...values),
    bestOutcomeValue: Math.max(...values),
  };
}

export function calculateRoi(
  investments: InvestmentItem[],
  outcomes: Outcome[],
): RoiSummary {
  const issues = [...investmentIssues(investments), ...outcomeIssues(outcomes)];
  const investmentItems = investments.map((item) => ({
    ...item,
    subtotal:
      isFiniteNumber(item.quantity) && isFiniteNumber(item.valuePerUnit)
        ? item.quantity * item.valuePerUnit
        : 0,
  }));
  const totalInvestment = investmentItems.reduce((sum, item) => sum + item.subtotal, 0);

  const probabilityTotal = outcomes.reduce(
    (sum, outcome) =>
      sum + (isFiniteNumber(outcome.probability) ? outcome.probability : 0),
    0,
  );
  const probabilityGap = 100 - probabilityTotal;
  const probabilityComplete = Math.abs(probabilityGap) <= PROBABILITY_TOLERANCE;
  if (!probabilityComplete) {
    issues.push({
      scope: "distribution",
      field: "probability",
      message:
        probabilityGap > 0
          ? `Assign the remaining ${probabilityGap.toFixed(2)}%.`
          : `Reduce probabilities by ${Math.abs(probabilityGap).toFixed(2)}%.`,
    });
  }
  if (!(totalInvestment > 0)) {
    issues.push({
      scope: "investment",
      message: "Total investment must be greater than zero for ROI.",
    });
  }

  const stageAllocations = EFFORT_STAGES.map((stage) => {
    const value = investmentItems
      .filter((item) => item.stage === stage.key)
      .reduce((sum, item) => sum + item.subtotal, 0);
    return {
      ...stage,
      value,
      share: totalInvestment > 0 ? (value / totalInvestment) * 100 : 0,
    };
  });

  const outcomeContributions = outcomes.map((outcome) => ({
    ...outcome,
    contribution:
      isFiniteNumber(outcome.probability) && isFiniteNumber(outcome.value)
        ? (outcome.probability / 100) * outcome.value
        : 0,
  }));

  if (issues.length > 0) {
    return {
      investmentItems,
      outcomeContributions,
      totalInvestment,
      probabilityTotal,
      probabilityGap,
      probabilityComplete,
      stageAllocations,
      issues,
      result: null,
    };
  }

  return {
    investmentItems,
    outcomeContributions,
    totalInvestment,
    probabilityTotal,
    probabilityGap,
    probabilityComplete,
    stageAllocations,
    issues,
    result: buildRoiResult(outcomeContributions, outcomes, totalInvestment),
  };
}
