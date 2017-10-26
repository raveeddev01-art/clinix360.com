import React, { Component } from "react";
import cx from "classnames";
import CUSTOMERS from "./customers";

export default class OurCustomers extends Component {
  renderCustomers() {
    return CUSTOMERS.map((c, index) => {
      const className = cx("col-lg-5ths col-md-3 col-xs-4", {
        "visible-lg": index % 5 === 4
      });
      return (
        <div className={className} key={`customer_${index}`}>
          <img src={c.img} alt={c.title} />
        </div>
      );
    });
  }

  render() {
    return (
      <div className="our-customers text-center">
        <div className="container">
          <h3>
            Thousands of healthcare providers are improving patient care through
            Stitch. <br />
            <strong>Join the movement.</strong>
          </h3>

          <div className="customer-logos">
            <div className="row logo-row">{this.renderCustomers()}</div>
          </div>
        </div>
      </div>
    );
  }
}
