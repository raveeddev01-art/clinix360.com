import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

import { FREQUENCIES } from "../constants";
import { getPrice, getFrequencyName } from "../utils";

const Plan = ({
  tier,
  planFrequency,
  billingFrequency,
  selected,
  onSelectBillingFrequency,
  onSelectTier
}) => {
  const frequencyName = getFrequencyName(planFrequency);
  const price = getPrice(tier, planFrequency);
  const className = classNames("plan-container", { selected });

  return (
    <div className={className} onClick={onSelectTier}>
      <div className="plan-description">
        <h4>
          {capitalize(tier)} {capitalize(frequencyName)} Plan
        </h4>
        <span>${price} per month for 1 user</span>
      </div>

      <div className="plan-price">
        <h4>${price}</h4>
        <span>per user / month</span>
      </div>

      {planFrequency && (
        <div className="billing-frequency">
          <p>Select billing frequency:</p>
          <div className="billing-frequency-options">
            {FREQUENCIES.map(freq => {
              return (
                <div key={freq.name} className="billing-frequency-option">
                  <span>{freq.title}:</span>
                  <span>$120 per user</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

Plan.propTypes = {
  tier: PropTypes.string.isRequired,
  planFrequency: PropTypes.number.isRequired,
  billingFrequency: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectBillingFrequency: PropTypes.func.isRequired,
  onSelectTier: PropTypes.func.isRequired
};

export default Plan;
