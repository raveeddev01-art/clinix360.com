import React, { Component } from "react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import PricingRowEnterprise from "./pricing-row-enterprise";

import { PRICING_TABLE_ENTERPRISE } from "../pricing_constants";

class PricingEnterprise extends Component {
  render() {
    return (
      <div className="m-b-40">
        <h3 className="pricing-table-heading text-center">
          <strong>InvoChat for Enterprise</strong> scales the power of team
          collaboration to the nation’s largest hospitals, health systems and
          InvoChat organizations.
        </h3>

        <Row>
          <Col md={10} mdOffset={1}>
            <Row>
              <Col md={4}>
                <div className="enterprise-contact-us">
                  <img
                    className="stitch-logo m-b-50"
                    src="/images/invochat-mono.png"
                    alt="InvoChat"
                  />
                </div>
              </Col>

              <Col md={8}>
                <div className="pricing-table enterprise-table m-b-50">
                  <div className="pricing-table__row header">
                    <div className="pricing-table__item">Compliance</div>
                  </div>

                  {PRICING_TABLE_ENTERPRISE.COMPLIANCE.map((row, index) => (
                    <PricingRowEnterprise
                      key={`row_${index}`}
                      feature={row.feature}
                    />
                  ))}

                  <div className="pricing-table__row header">
                    <div className="pricing-table__item">Features</div>
                  </div>

                  {PRICING_TABLE_ENTERPRISE.FEATURES.map((row, index) => (
                    <PricingRowEnterprise
                      key={`row_${index}`}
                      feature={row.feature}
                    />
                  ))}

                  <div className="pricing-table__row header">
                    <div className="pricing-table__item">Support</div>
                  </div>

                  {PRICING_TABLE_ENTERPRISE.SUPPORT.map((row, index) => (
                    <PricingRowEnterprise
                      key={`row_${index}`}
                      feature={row.feature}
                    />
                  ))}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default PricingEnterprise;
