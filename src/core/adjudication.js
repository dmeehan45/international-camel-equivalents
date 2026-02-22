/**
 * @typedef {Object} AdjudicationFormulaInput
 * @property {number} baseCamelValue
 * @property {number} regionFactor
 * @property {number} traitBonuses
 */

/**
 * @typedef {Object} AdjudicationFormulaOutput
 * @property {number} adjustedCamelValue
 */

/**
 * Pure adjudication formula: base * regionFactor + traitBonuses.
 * @param {AdjudicationFormulaInput} input
 * @returns {AdjudicationFormulaOutput}
 */
export function calculateAdjudicatedCamelValue(input) {
  const adjustedCamelValue = Number(((input.baseCamelValue * input.regionFactor) + input.traitBonuses).toFixed(2));
  return { adjustedCamelValue };
}
