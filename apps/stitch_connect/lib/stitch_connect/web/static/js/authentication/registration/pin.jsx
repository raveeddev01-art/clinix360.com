import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Pin extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>PIN</h2>

        <h5>Enter a <strong>4-digit PIN</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="password" placeholder="0000" />
          </FormGroup>
          
          <HelpBlock>You can use this pin when your screen is locked after a period of inactivity.</HelpBlock>

          <Link to="/signup/invites" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}