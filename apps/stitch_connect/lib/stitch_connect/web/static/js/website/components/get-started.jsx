import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";

import Button from "react-bootstrap/lib/Button";

export default class GetStarted extends Component {
  render() {
    return (
      <div className="get-started">
        <div className="container">
          <div className="flex-box">
            <div className="flex-item">
              <h2>
                <strong className="hidden-md hidden-lg">
                  Ready to get started?
                </strong>
                <strong className="hidden-xs hidden-sm">
                  Ready to bring Stitch to your team?
                </strong>
                <br /> <span>Start a free trial today, or book a demo.</span>
              </h2>
            </div>

            <div className="flex-item text-right">
              <Button
                bsSize="lg"
                bsStyle="primary"
                block
                href={`https://${applicationHost}/signup/email`}
              >
                Start Trial
              </Button>

              <LinkContainer to="/demo">
                <Button bsSize="lg">Request Demo</Button>
              </LinkContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
