import React from "react";
import PropTypes from "prop-types";

import FrequencyToggle from "./FrequencyToggle";
import Plan from "./Plan";

const Plans = ({
  plan,
  tiers,
  onSelectPlanFrequency,
  onSelectBillingFrequency,
  onSelectPlan,
  onCheckoutPlan
}) => {
  return (
    <div className="plans">
      <p>Please select a plan to continue service:</p>

      <FrequencyToggle
        frequency={!!plan.planFrequency}
        onToggle={onSelectPlanFrequency(1 - plan.planFrequency)}
      />

      {tiers.map(tier => (
        <Plan
          key={tier}
          tier={tier}
          frequency={plan.planFrequency}
          selected={plan.tier === tier}
          onSelect={onSelectPlan(tier)}
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
  onSelectPlanFrequency: PropTypes.func.isRequired,
  onSelectBillingFrequency: PropTypes.func.isRequired,
  onSelectPlan: PropTypes.func.isRequired,
  onCheckoutPlan: PropTypes.func.isRequired
};

export default Plans;
