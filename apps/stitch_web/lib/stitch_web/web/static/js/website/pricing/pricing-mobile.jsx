import React, { Component } from "react";

import Panel from "react-bootstrap/lib/Panel";
import Label from "react-bootstrap/lib/Label";
import Button from "react-bootstrap/lib/Button";

import PricingRowMobile from "./pricing-row-mobile";

import { PRICING_TABLE_MOBILE } from "../pricing_constants";

// Hide previous pricing components
// import ProductCards from "../components/product-cards";
// import PriceTier from "../components/price-tier";

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
      <div>
        <Panel className="m-b-40">
          <Panel.Body>
            <div className="pricing-table">
              <div className="pricing-table__row tiers">
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
              </div>

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Stitch Platform</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.PLATFORM.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Team Messaging</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.TEAM_MESSAGING.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Administration</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.ADMINISTRATION.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}
            </div>
          </Panel.Body>
        </Panel>

        <Panel className="m-b-40">
          <Panel.Body>
            <div className="pricing-table">
              <div className="pricing-table__row tiers">
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
                    Try Free
                  </Button>
                </div>
              </div>

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Team Messaging</div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.TEAM_MESSAGING.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Patient Communication</div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.PATIENT_COMMUNICATION.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">
                  Task Management <Label>Coming Soon!</Label>
                </div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.TASK_MANAGEMENT.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Administration</div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.ADMINISTRATION.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}
            </div>
          </Panel.Body>
        </Panel>

        <Panel className="m-b-40">
          <Panel.Body>
            <div className="pricing-table">
              <div className="pricing-table__row tiers">
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
                <div className="pricing-table__item">Patient Communication</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.PATIENT_COMMUNICATION.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Task Management</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.TASK_MANAGEMENT.map(
                (row, index) => (
                  <PricingRowMobile
                    key={`row_${index}`}
                    feature={row.feature}
                  />
                )
              )}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Administration</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.ADMINISTRATION.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}
            </div>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}
