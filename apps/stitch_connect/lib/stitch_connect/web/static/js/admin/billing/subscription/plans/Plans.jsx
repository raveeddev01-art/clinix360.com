import React from "react";
import PropTypes from "prop-types";

import FrequencyToggle from "./FrequencyToggle";
import Plan from "./Plan";

const Plans = ({
  plan,
  tiers,
  onSelectFrequency,
  onSelectTier,
  onCheckoutPlan
}) => {
  return (
    <div className="plans">
      <p>Please select a plan to continue service:</p>
      <FrequencyToggle
        frequency={!!plan.frequency}
        onToggle={() => {
          onSelectFrequency(1 - plan.frequency);
        }}
      />

      {tiers.map(tier => (
        <Plan
          key={tier}
          tier={tier}
          selected={plan.tier === tier}
          frequency={plan.frequency}
          onSelectTier={onSelectTier}
        />
      ))}

      <div className="clearfix">
        <button
          type="button"
          className="btn btn-fancy btn-primary pull-right"
          disabled={!plan.tier}
          onClick={onCheckoutPlan}
        >
          Select Plan
        </button>
      </div>
    </div>
  );
};

Plans.propTypes = {
  plan: PropTypes.object.isRequired,
  tiers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectFrequency: PropTypes.func.isRequired,
  onSelectTier: PropTypes.func.isRequired,
  onCheckoutPlan: PropTypes.func.isRequired
};

export default Plans;
