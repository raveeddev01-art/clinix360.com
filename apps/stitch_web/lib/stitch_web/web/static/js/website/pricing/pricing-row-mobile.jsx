import React, { Component } from "react";
import PropTypes from "prop-types";

class PricingRowMobile extends Component {
  render() {
    const { feature } = this.props;

    return (
      <div className="pricing-table__row">
        <div className="pricing-table__item">{feature}</div>

        <div className="pricing-table__item">
          <i className="fa fa-check-circle" />
        </div>
      </div>
    );
  }
}

PricingRowMobile.defaultProps = {
  feature: ""
};

PricingRowMobile.propTypes = {
  feature: PropTypes.string
};

export default PricingRowMobile;
