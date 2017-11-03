import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

import { PLANS, FREQUENCIES } from "./constants";

const Plan = ({ tier, frequency, selected, onSelect }) => {
  const plan = PLANS[tier];
  const price = plan.pricePerMonth[FREQUENCIES[frequency]];
  const className = classNames("plan-container", { selected });

  return (
    <div className={className} onClick={onSelect}>
      <div className="plan-description">
        <h4>{capitalize(tier)} Basic Monthly Plan</h4>
        <span>${price} per month for 1 user</span>
      </div>

      <div className="plan-price">
        <h4>${price}</h4>
        <span>per user / month</span>
      </div>
    </div>
  );
};

Plan.propTypes = {
  tier: PropTypes.string.isRequired,
  frequency: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default Plan;
