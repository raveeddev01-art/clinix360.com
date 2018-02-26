import React, { Component } from "react";

import Button from "react-bootstrap/lib/Button";

class ManagePreview extends Component {
  render() {
    return (
      <div className="preview">
        <div className="preview-flex">
          <div className="preview-content">
            <h1 className="m-b-20">
              Your tasks in one place. <br />Your team on the same page.
            </h1>

            <h4 className="m-b-30">
              Create tasks, assign them to team members and know when they’re
              completed. Stitch Manage is the easiest way to keep all your
              patient tasks organized. Never miss a beat delivering seamless,
              on-time care to your patients.
            </h4>

            <Button
              bsSize="large"
              bsStyle="primary"
              target="_blank"
              rel="noopener noreferrer"
              href="https://teamstitch.typeform.com/to/Yt22AI"
            >
              Request Access
            </Button>
          </div>

          <div className="preview-image">
            <img src="/images/manage-icon.png" alt="Stitch Connect" />
          </div>
        </div>
      </div>
    );
  }
}

export default ManagePreview;
