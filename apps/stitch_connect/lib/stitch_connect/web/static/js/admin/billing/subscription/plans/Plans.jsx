import React from "react";
import PropTypes from "prop-types";

import FrequencyToggle from "./FrequencyToggle";
import Plan from "./Plan";

const Plans = ({ plan, tiers, onToggleFrequency, onSelect, onCheckout }) => {
  return (
    <div className="plans">
      <p>Please select a plan to continue service:</p>

      <FrequencyToggle
        frequency={!!plan.planFrequency}
        onToggle={onToggleFrequency}
      />

      {tiers.map(tier => (
        <Plan
          key={tier}
          tier={tier}
          frequency={plan.planFrequency}
          selected={plan.tier === tier}
          onSelect={onSelect(tier)}
        />
      ))}

      <div className="clearfix">
        <button
          type="button"
          className="btn btn-fancy btn-primary pull-right"
          disabled={!plan.tier}
          onClick={onCheckout}
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
  onToggleFrequency: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired
};

export default Plans;
