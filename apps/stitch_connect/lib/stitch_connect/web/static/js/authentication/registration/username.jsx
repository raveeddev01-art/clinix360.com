import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Username extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Username</h2>

        <h5>Enter a <strong>username</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="username" />
          </FormGroup>
          
          <HelpBlock>Your username is how other users will mention you in conversations. Pick something familiar.</HelpBlock>

          <Link to="/signup/password" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}