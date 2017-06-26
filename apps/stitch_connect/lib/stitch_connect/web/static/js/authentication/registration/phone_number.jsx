import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class PhoneNumber extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Phone Number</h2>

        <h5>Enter your <strong>phone number</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="Phone Number" />
          </FormGroup>
          
          <HelpBlock>Your phone number will be shown in your profile so you can be reached.</HelpBlock>

          <Link to="/signup/username" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}