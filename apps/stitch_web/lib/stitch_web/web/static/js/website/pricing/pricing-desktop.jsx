import React, { Component } from "react";

import Panel from "react-bootstrap/lib/Panel";
import Label from "react-bootstrap/lib/Label";
import Button from "react-bootstrap/lib/Button";

import PricingRow from "./pricing-row";

import { PRICING_TABLE } from "../pricing_constants";

export default class PricingDesktop extends Component {
  constructor(props) {
    super(props);
    this.state = { monthlyPricing: true };
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
                  src="/images/logo-blue.svg"
                  alt="Stitch"
                  className="img img-responsive"
                />
              </div>

              <div className="pricing-table__item">
                <h4>Basic</h4>

                <h2>
                  <span>$</span>
                  {monthlyPricing ? 0 : 0}
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>

                <Button bsStyle="primary" bsSize="lg" block>
                  Try Free
                </Button>
              </div>

              <div className="pricing-table__item">
                <h4>Standard</h4>

                <h2>
                  <span>$</span>
                  {monthlyPricing ? 59 : 49}
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>

                <Button bsStyle="primary" bsSize="lg" block>
                  Buy Standard
                </Button>
              </div>

              <div className="pricing-table__item">
                <h4>Premium</h4>

                <h2>
                  <span>$</span>
                  {monthlyPricing ? 119 : 99}
                </h2>

                <p className="text-muted">
                  per user per month <br />billed{" "}
                  <a role="button" onClick={this.handleClick}>
                    {monthlyPricing ? "monthly" : "annually"}
                  </a>
                </p>

                <Button bsStyle="primary" bsSize="lg" block>
                  Coming Soon
                </Button>
              </div>
            </div>

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Stitch Platform</div>
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
              <div className="pricing-table__item">Team Messaging</div>
            </div>

            {PRICING_TABLE.TEAM_MESSAGING.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">Patient Communication</div>
            </div>

            {PRICING_TABLE.PATIENT_COMMUNICATION.map((row, index) => (
              <PricingRow
                key={`row_${index}`}
                feature={row.feature}
                basic={row.basic}
                standard={row.standard}
                premium={row.premium}
              />
            ))}

            <div className="pricing-table__row header">
              <div className="pricing-table__item">
                Task Management <Label>Coming Soon!</Label>
              </div>
            </div>

            {PRICING_TABLE.TASK_MANAGEMENT.map((row, index) => (
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

            <div className="pricing-table__row">
              <div className="pricing-table__item" />

              <div className="pricing-table__item">
                <Button bsStyle="primary" bsSize="lg" block>
                  Try Free
                </Button>
              </div>

              <div className="pricing-table__item">
                <Button bsStyle="primary" bsSize="lg" block>
                  Buy Standard
                </Button>
              </div>

              <div className="pricing-table__item">
                <Button bsStyle="primary" bsSize="lg" block>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </Panel.Body>
      </Panel>
    );
  }
}
