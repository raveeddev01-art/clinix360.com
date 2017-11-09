import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

import { FREQUENCIES } from "../constants";
import { getMonthlyPrice, getFrequencyName } from "../utils";

class Plan extends React.Component {
  onSelectTier = () => {
    const { selected, tier, onSelectTier } = this.props;

    if (!selected) {
      onSelectTier(tier);
    }
  };

  render() {
    const { tier, frequency, selected } = this.props;
    const frequencyName = getFrequencyName(frequency);
    const monthlyPrice = getMonthlyPrice(tier, frequency);
    const className = classNames("plan-container", { selected });

    return (
      <div className={className} onClick={this.onSelectTier}>
        <div className="plan-content">
          <div className="plan-title">
            <h4>
              {capitalize(tier)} {capitalize(frequencyName)} Plan
            </h4>
            <span>${monthlyPrice} per month for 1 user</span>
          </div>

          <div className="plan-price">
            <h4>${monthlyPrice}</h4>
            <span>per user / month</span>
          </div>
        </div>
      </div>
    );
  }
}

Plan.propTypes = {
  tier: PropTypes.string.isRequired,
  frequency: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectTier: PropTypes.func.isRequired
};

export default Plan;
