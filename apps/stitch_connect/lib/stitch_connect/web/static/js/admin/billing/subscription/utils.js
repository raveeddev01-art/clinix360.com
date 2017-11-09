import { TIERS, PLANS, FREQUENCIES } from "./constants";

const getSelectableTiers = () => {
  return TIERS;
};

const getUpgradableTiers = tier => {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 0) {
    return [];
  }

  return TIERS.slice(index + 1);
};

const getBelowTier = tier => {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 1) {
    return "";
  }

  return TIERS[index - 1];
};

const getPlanForTier = tier => {
  return PLANS[tier];
};

const getFrequency = frequencyIndex => {
  return FREQUENCIES[frequencyIndex];
};

const getFrequencyName = frequencyIndex => {
  return FREQUENCIES[frequencyIndex].name;
};

const getMonthlyPrice = (tier, frequencyIndex) => {
  const plan = getPlanForTier(tier);
  const frequencyName = getFrequencyName(frequencyIndex);

  return plan.pricePerMonth[frequencyName];
};

export {
  getSelectableTiers,
  getUpgradableTiers,
  getBelowTier,
  getPlanForTier,
  getFrequency,
  getFrequencyName,
  getMonthlyPrice
};
