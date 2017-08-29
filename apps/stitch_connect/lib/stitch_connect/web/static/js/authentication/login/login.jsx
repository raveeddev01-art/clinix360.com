import React, { Component } from "react";
import { Link } from "react-router-dom";
import { inject, observer } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("authenticationStore")
@observer
export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <h2>
          {this.props.authenticationStore.instance.teamName}
        </h2>
        <h5 className="text-muted url-heading">
          {this.props.authenticationStore.instance.teamSlug}.teamstitch.com
        </h5>

        <h5>
          Enter your <strong>email address</strong> and{" "}
          <strong>password</strong>.
        </h5>

        <form action="/login" method="post">
          <input type="hidden" name="_csrf_token" value={window.csrfToken} />

          <FormGroup bsSize="large">
            <FormControl
              name="email"
              required
              autoFocus
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup bsSize="large">
            <FormControl
              name="password"
              required
              type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.handleChange}
            />
          </FormGroup>

          {
            <p>
              {this.props.invalidLogin}
            </p>
          }

          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block"
          >
            Login
          </Button>
          <Link
            to="/reset-password"
            className="btn btn-block btn-lg btn-default m-b-40"
          >
            Reset Password
          </Link>
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
