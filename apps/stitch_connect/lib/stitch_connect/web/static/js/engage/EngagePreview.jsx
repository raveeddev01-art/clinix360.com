import React, { Component } from "react";

import Button from "react-bootstrap/lib/Button";

class EngagePreview extends Component {
  render() {
    return (
      <div className="preview">
        <div className="preview-flex">
          <div className="preview-content">
            <h1 className="m-b-20">
              Engage your patients. <br />See more revenue.
            </h1>

            <h4 className="m-b-30">
              Send messages, share files and start video calls directly with
              patients. Maximize return visits and referrals with our patient
              communication tool designed to help you deliver a phenomenal
              customer experience.
            </h4>

            <Button
              bsSize="large"
              bsStyle="primary"
              target="_blank"
              rel="noopener noreferrer"
              href="https://teamstitch.typeform.com/to/Ncn8x8"
            >
              Request Access
            </Button>
          </div>

          <div className="preview-image">
            <img src="/images/engage-icon.png" alt="Stitch Connect" />
          </div>
        </div>
      </div>
    );
  }
}

export default EngagePreview;
