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
                  Ready to bring Stitch to your team?
                </strong>
                <strong className="hidden-xs hidden-sm">
                  Ready to bring Stitch to your team?
                </strong>
                <br />{" "}
                <span>Free to use with an unlimited number of people.</span>
              </h2>
            </div>

            <div className="flex-item text-right">
              <Button
                bsStyle="primary"
                block
                href="https://teamstitch.com/signup/email"
              >
                Get Started
              </Button>

              <LinkContainer to="/demo">
                <Button>Request Demo</Button>
              </LinkContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
