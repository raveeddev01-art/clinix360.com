import React, { Component } from "react";
import { Link } from "react-router-dom";

import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Hipaa extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>HIPAA</h2>

        <h5><strong>Business Associate Agreement</strong></h5>

        <form>
          <Checkbox>I agree to the terms of the HIPAA BAA</Checkbox>
          
          <HelpBlock>Learn more about BAAs <a href="#">here</a>. By checking the box above, you represent that your team agrees to the terms of the <a href="#">HIPAA BAA</a>.</HelpBlock>

          <Link to="/signup/app-download" className="btn btn-block btn-primary btn-done">Done!</Link>

          <HelpBlock>By proceeding to use Stitch, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</HelpBlock>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}