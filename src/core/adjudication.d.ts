export type AdjudicationFormulaInput = {
  baseCamelValue: number;
  regionFactor: number;
  traitBonuses: number;
};

export type AdjudicationFormulaOutput = {
  adjustedCamelValue: number;
};

export function calculateAdjudicatedCamelValue(input: AdjudicationFormulaInput): AdjudicationFormulaOutput;
