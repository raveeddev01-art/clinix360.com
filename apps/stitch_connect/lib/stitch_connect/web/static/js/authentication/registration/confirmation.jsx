import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Confirmation extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Check your email!</h2>

        <h5>Enter your <strong>confirmation code</strong>.</h5>

        <form>
          <div className="confirmation-code">
            <div className="input-group code-group">
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
            </div>

            <div className="code-separator">—</div>

            <div className="input-group code-group">
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
            </div>
            <div className="clearfix"></div>
          </div>

          <HelpBlock>We sent a six-digit confirmation code to <strong>email@here.com</strong> to verify your email address.</HelpBlock>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}