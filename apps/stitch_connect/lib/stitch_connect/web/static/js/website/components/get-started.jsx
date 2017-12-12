import React, { Component } from "react";
import { Link } from "react-router-dom";

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
                <br /> Start a free trial today, or book a demo.
              </h2>
            </div>

            <div className="flex-item text-right">
              <Button bsSize="lg" bsStyle="primary" block>
                Start Trial
              </Button>
              <Button bsSize="lg">Schedule Demo</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
