import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import CUSTOMERS from "./customers-logos";

class OurCustomers extends Component {
  renderCustomers() {
    return CUSTOMERS.map((c, index) => {
      const className = cx("col-lg-5ths col-md-3 col-xs-4", {
        "visible-lg no-border": index % 5 === 4,
      });
      return (
        <div className={className} key={`customer_${index}`}>
          <img src={c.img} alt={c.title} />
        </div>
      );
    });
  }

  render() {
    const { withoutText } = this.props;
    return (
      <div className="our-customers">
        <div className="container">
          {withoutText ? (
            ""
          ) : (
            <div>
              <h2>Trusted by the best teams</h2>
              <h3>
                Healthcare organizations big and small have made Clinix360 their
                home base for work.
              </h3>

              <hr className="section-line" />
            </div>
          )}

          <div className="customer-logos text-center">
            <div className="row logo-row">{this.renderCustomers()}</div>
          </div>
        </div>
      </div>
    );
  }
}

OurCustomers.defaultProps = {
  withoutText: false,
};

OurCustomers.propTypes = {
  withoutText: PropTypes.bool,
};

export default OurCustomers;
