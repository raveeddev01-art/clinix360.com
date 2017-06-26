import React, { Component } from "react";

import Button from "react-bootstrap/lib/Button";

export default class GetStarted extends Component {
  render() {
    return (
        <div className="authentication-card text-center">
          <h2>Healthcare Messaging</h2>

          <h4>Communicate, write notes, track tasks, upload files, and collaborate on any device.</h4>

          <Button bsStyle="primary" block>Sign In</Button>
          <Button block className="btn-create-team">Create Team</Button>

          <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
        </div>
    );
  }
}