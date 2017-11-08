import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

import { FREQUENCIES } from "../constants";
import { getPrice, getFrequencyName } from "../utils";

class Plan extends React.Component {
  onSelectTier = () => {
    const { selected, tier, onSelectTier } = this.props;

    if (!selected) {
      onSelectTier(tier);
    }
  };

  renderBillingFrequency() {
    const {
      planFrequency,
      selected,
      billingFrequency,
      onSelectBillingFrequency
    } = this.props;

    return (
      selected &&
      !!planFrequency && (
        <div className="plan-billing-frequency">
          <p className="plan-billing-frequency-title">
            Select billing frequency:
          </p>

          <div className="plan-billing-frequency-options">
            {FREQUENCIES.map((freq, index) => {
              const className = classNames("plan-billing-frequency-option", {
                selected: billingFrequency === index
              });

              return (
                <div
                  key={freq.name}
                  className={className}
                  onClick={() => {
                    onSelectBillingFrequency(index);
                  }}
                >
                  <div className="billing-title">{capitalize(freq.title)}:</div>
                  <div className="billing-desc">
                    <span className="billing-price">$120</span> per user
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    );
  }

  render() {
    const { tier, planFrequency, selected } = this.props;
    const frequencyName = getFrequencyName(planFrequency);
    const price = getPrice(tier, planFrequency);
    const className = classNames("plan-container", { selected });

    return (
      <div className={className} onClick={this.onSelectTier}>
        <div className="plan-content">
          <div className="plan-title">
            <h4>
              {capitalize(tier)} {capitalize(frequencyName)} Plan
            </h4>
            <span>${price} per month for 1 user</span>
          </div>

          <div className="plan-price">
            <h4>${price}</h4>
            <span>per user / month</span>
          </div>
        </div>

        {this.renderBillingFrequency()}
      </div>
    );
  }
}

Plan.propTypes = {
  tier: PropTypes.string.isRequired,
  planFrequency: PropTypes.number.isRequired,
  billingFrequency: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectBillingFrequency: PropTypes.func.isRequired,
  onSelectTier: PropTypes.func.isRequired
};

export default Plan;
