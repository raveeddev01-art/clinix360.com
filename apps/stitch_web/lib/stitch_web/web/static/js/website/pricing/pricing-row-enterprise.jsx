import React, { Component } from "react";
import PropTypes from "prop-types";

class PricingRowEnterprise extends Component {
  render() {
    const { feature } = this.props;

    return (
      <div className="pricing-table__row">
        <div className="pricing-table__item enterprise-item">
          <i className="far fa-check-circle" /> {feature}
        </div>
      </div>
    );
  }
}

PricingRowEnterprise.propTypes = {
  feature: PropTypes.string.isRequired
};

export default PricingRowEnterprise;
