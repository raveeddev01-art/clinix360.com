import React, { Component } from "react";
import PropTypes from "prop-types";

class PricingRow extends Component {
  render() {
    const { feature, basic, standard, premium } = this.props;

    return (
      <div className="pricing-table__row">
        <div className="pricing-table__item">{feature}</div>

        <div className="pricing-table__item">
          {basic ? <i className="far fa-check-circle" /> : basic}
        </div>

        <div className="pricing-table__item">
          {standard ? <i className="far fa-check-circle" /> : standard}
        </div>

        <div className="pricing-table__item">
          {premium ? <i className="far fa-check-circle" /> : premium}
        </div>
      </div>
    );
  }
}

PricingRow.defaultProps = {
  feature: "",
  basic: false,
  standard: false,
  premium: false
};

PricingRow.propTypes = {
  feature: PropTypes.string,
  basic: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  standard: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  premium: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default PricingRow;
