import React, { Component } from "react";

import Panel from "react-bootstrap/lib/Panel";
import Label from "react-bootstrap/lib/Label";
import Button from "react-bootstrap/lib/Button";

import PricingRowMobile from "./pricing-row-mobile";

import { PRICING_TABLE_MOBILE } from "../pricing_constants";

export default class PricingMobile extends Component {
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
      <div>
        {/* <Panel className="m-b-40">
          <Panel.Body>
            <div className="pricing-table">
              <div className="pricing-table__row tiers">
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

                  <Button
                    href="/getstarted"
                    bsStyle="primary"
                    bsSize="lg"
                    block
                  >
                    Try Free
                  </Button>
                </div>
              </div>

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Platform</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.PLATFORM.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Communication</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.COMMUNICATION.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">File Sharing</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.FILE_SHARING.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Productivity</div>
              </div>

              {PRICING_TABLE_MOBILE.BASIC.PRODUCTIVITY.map((row, index) => (
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
                    {monthlyPricing ? 6 : 5}
                  </h2>

                  <p className="text-muted">
                    per user per month <br />billed{" "}
                    <a role="button" onClick={this.handleClick}>
                      {monthlyPricing ? "monthly" : "annually"}
                    </a>
                  </p>

                  <Button
                    href={appSettings.hasLogin ? "/signin" : "/getstarted"}
                    bsStyle="primary"
                    bsSize="lg"
                    block
                    className="m-b-30"
                  >
                    Buy Standard
                  </Button>

                  <p className="m-b-0">
                    Includes everything in <strong>Basic</strong> and:
                  </p>
                </div>
              </div>

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Communication</div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.COMMUNICATION.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">File Sharing</div>
              </div>

              {PRICING_TABLE_MOBILE.STANDARD.FILE_SHARING.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

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
        </Panel> */}

        <Panel className="m-b-40">
          <Panel.Body>
            <div className="pricing-table">
              <div className="pricing-table__row tiers">
                <div className="pricing-table__item">
                  <h4>Premium</h4>

                  <h2>
                    <span>$</span>
                    {monthlyPricing ? 48 : 40}
                  </h2>

                  <p className="text-muted">
                    per month <br />billed{" "}
                    <a role="button" onClick={this.handleClick}>
                      {monthlyPricing ? "monthly" : "annually"}
                    </a>
                  </p>

                  <Button
                    href={appSettings.hasLogin ? "/signin" : "/getstarted"}
                    bsStyle="primary"
                    bsSize="lg"
                    block
                    className="m-b-30"
                  >
                    Buy Premium
                  </Button>
{/* 
                  <p className="m-b-0">
                    Includes everything in <strong>Standard</strong> and:
                  </p> */}
                </div>
              </div>

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Platform</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.PLATFORM.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Communication</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.FILE_SHARING.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              <div className="pricing-table__row header">
                <div className="pricing-table__item">Productivity</div>
              </div>

              {PRICING_TABLE_MOBILE.PREMIUM.PRODUCTIVITY.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

              {PRICING_TABLE_MOBILE.PREMIUM.COMMUNICATION.map((row, index) => (
                <PricingRowMobile key={`row_${index}`} feature={row.feature} />
              ))}

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
