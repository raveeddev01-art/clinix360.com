import React, { Component } from "react";
import PropTypes from "prop-types";

class PricingRowMobile extends Component {
  render() {
    const { feature } = this.props;

    return (
      <div className="pricing-table__row">
        <div className="pricing-table__item">
          <i className="far fa-check-circle mobile-check" /> {feature}
        </div>

        <div className="pricing-table__item mobile-cell">
          <i className="far fa-check-circle" />
        </div>
      </div>
    );
  }
}

PricingRowMobile.propTypes = {
  feature: PropTypes.string.isRequired
};

export default PricingRowMobile;
