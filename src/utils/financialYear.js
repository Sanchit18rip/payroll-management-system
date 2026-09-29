// Indian financial year runs April 1 → March 31.
// At any date: Jan–Mar belong to the FY that started the previous April,
// Apr–Dec belong to the FY that started this April.

export const getCurrentFinancialYear = (date = new Date()) => {
  const month = date.getMonth(); // 0-indexed (0 = January)
  const startYear = month >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
};

// Fallback list when the API is unreachable. Newest first, matching the
// ordering the backend returns (next, current, then past years).
export const getFallbackFinancialYears = (date = new Date()) => {
  const month = date.getMonth();
  const startYear = month >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return [
    `${startYear + 1}-${startYear + 2}`, // next
    `${startYear}-${startYear + 1}`,     // current
    `${startYear - 1}-${startYear}`,     // past 1
    `${startYear - 2}-${startYear - 1}`, // past 2
  ];
};

// Default selection: always the *current* financial year when it is in the
// list, otherwise the newest available year (or the current FY as last resort).
export const pickDefaultFinancialYear = (years = []) => {
  const current = getCurrentFinancialYear();
  return years.includes(current) ? current : years[0] || current;
};