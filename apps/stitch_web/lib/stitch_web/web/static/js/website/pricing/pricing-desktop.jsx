import React, { Component } from "react";

import Panel from "react-bootstrap/lib/Panel";
import Label from "react-bootstrap/lib/Label";
import Button from "react-bootstrap/lib/Button";

import PricingRow from "./pricing-row";

import { PRICING_TABLE } from "../pricing_constants";

export default class PricingDesktop extends Component {
  constructor(props) {
    super(props);
    this.state = { monthlyPricing: false };
  }

  handleClick = () => {
    this.setState(prevState => ({
      monthlyPricing: !prevState.monthlyPricing
    }));
  };

  render() {
    const { monthlyPricing } = this.state;

    return (
      <Panel className="m-b-40">
        <Panel.Body>
          <div className="pricing-table">
            <div className="pricing-table__row tiers">
              <div className="pricing-table__item">
                <img
                  src="/images/high-res.png"
                  alt="InvoChat"
                  className="img img-responsive"
                />
              </div>

              <div className="pricing-table__item">
                <h4>Basic</h4>

                <h2>
                  <span>$</span>
                  0
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>
              </div>

              <div className="pricing-table__item">
                <h4>Standard</h4>

                <h2>
                  <span>$</span>
                  {monthlyPricing ? 6 : 5}
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>
              </div>

              <div className="pricing-table__item">
                <h4>Premium</h4>

                <h2>
                  <span>$</span>
                  {monthlyPricing ? 12 : 10}
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>
              </div>
            </div>

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Platform</div>
            </div>

            {PRICING_TABLE.PLATFORM.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Communication</div>
            </div>

            {PRICING_TABLE.COMMUNICATION.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">File Sharing</div>
            </div>

            {PRICING_TABLE.FILE_SHARING.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Productivity</div>
            </div>

            {PRICING_TABLE.PRODUCTIVITY.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Administration</div>
            </div>

            {PRICING_TABLE.ADMINISTRATION.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}
          </div>
        </Panel.Body>
      </Panel>
    );
  }
}
