import { TIERS } from "./constants";

export function getUpgradableTiers(tier) {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 0) {
    return [];
  }

  return TIERS.slice(index + 1);
}
