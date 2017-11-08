import { TIERS, PLANS, FREQUENCIES } from "./constants";

export function getUpgradableTiers(tier) {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 0) {
    return [];
  }

  return TIERS.slice(index + 1);
}

export function getFrequencyName(frequencyIndex) {
  return FREQUENCIES[frequencyIndex].name;
}

export function getMonthlyPrice(tier, frequencyIndex) {
  const plan = PLANS[tier];
  const frequencyName = getFrequencyName(frequencyIndex);

  return plan.pricePerMonth[frequencyName];
}
