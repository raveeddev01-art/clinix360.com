import { TIERS, PLANS, FREQUENCIES } from "./constants";

const getUpgradableTiers = tier => {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 0) {
    return [];
  }

  return TIERS.slice(index + 1);
};

const getFrequency = frequencyIndex => {
  return FREQUENCIES[frequencyIndex];
};

const getFrequencyName = frequencyIndex => {
  return FREQUENCIES[frequencyIndex].name;
};

const getMonthlyPrice = (tier, frequencyIndex) => {
  const plan = PLANS[tier];
  const frequencyName = getFrequencyName(frequencyIndex);

  return plan.pricePerMonth[frequencyName];
};

export { getUpgradableTiers, getFrequency, getFrequencyName, getMonthlyPrice };
