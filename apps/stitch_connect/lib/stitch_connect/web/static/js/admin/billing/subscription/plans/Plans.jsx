import React from "react";
import PropTypes from "prop-types";

import FrequencyToggle from "./FrequencyToggle";
import Plan from "./Plan";

const Plans = ({
  plan,
  tiers,
  onSelectPlanFrequency,
  onSelectBillingFrequency,
  onSelectTier,
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
          selected={plan.tier === tier}
          planFrequency={plan.planFrequency}
          billingFrequency={plan.billingFrequency}
          onSelectBillingFrequency={onSelectBillingFrequency}
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
  onSelectPlanFrequency: PropTypes.func.isRequired,
  onSelectBillingFrequency: PropTypes.func.isRequired,
  onSelectTier: PropTypes.func.isRequired,
  onCheckoutPlan: PropTypes.func.isRequired
};

export default Plans;
