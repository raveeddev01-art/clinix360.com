import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import Alert from "react-bootstrap/lib/Alert";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@observer
export default class Password extends Component {
  constructor(props) {
    super();
    this.state = {
      formValid: false,
      password: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      formValid: this.password_valid(value)
    });
  };

  password_valid = value => {
    var PasswordPolicy = require("password-sheriff").PasswordPolicy;
    var charsets = require("password-sheriff").charsets;

    var containsAtLeastPolicy = new PasswordPolicy({
      length: { minLength: 8 }
    });

    return containsAtLeastPolicy.check(value);
  };

  handleSubmit = event => {
    event.preventDefault();
    store.instance.password = this.state.password;
    this.props.history.push("/signup/pin");
  };

  render() {
    return (
      <div>
        {this.state.error &&
          <Alert>The password doesn't meet the requirements.</Alert>}

        <div className="authentication-card text-center">
          <div className="card-header">
            <Row>
              <Col xs={6} className="text-left">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="back">Back</Tooltip>}
                >
                  <Link to="/signup/username">
                    <i className="fa fa-arrow-left" />
                  </Link>
                </OverlayTrigger>
              </Col>

              <Col xs={6} className="text-right">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="restart">Restart</Tooltip>}
                >
                  <Link to="/signup/team-name">
                    <i className="fa fa-refresh" />
                  </Link>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>

          <h2>Password</h2>

          <h5>
            Enter a <strong>password</strong>.
          </h5>

          <form onSubmit={this.handleSubmit}>
            <FormGroup bsSize="large">
              <FormControl
                name="password"
                required
                autoFocus
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </FormGroup>

            <HelpBlock className="m-b-20">
              Your password must contain:
              <ul className="list-unstyled">
                <li>At least 8 characters</li>
                <li>An uppercase letter</li>
                <li>A lowercase letter</li>
                <li>A number</li>
                <li>A special character (e.g. !$#)</li>
              </ul>
            </HelpBlock>

            <input
              disabled={!this.state.formValid}
              value="Next"
              type="submit"
              className="btn btn-block btn-lg btn-primary m-b-40"
            />
          </form>

          <p className="copyright m-b-0">
            &copy; 2017 Stitch Technologies, Inc
          </p>
        </div>
      </div>
    );
  }
}
