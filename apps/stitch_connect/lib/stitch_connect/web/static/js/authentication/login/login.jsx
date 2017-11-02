import React, { Component } from "react";
import { Link } from "react-router-dom";
import { inject, observer } from "mobx-react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("registrationStore", "titleStore")
@observer
export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
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
      <div>
        <div className="authentication-card text-center m-b-20">
          <h2>{this.props.registrationStore.teamName}</h2>
          <h5 className="text-muted url-heading">
            {this.props.registrationStore.teamSlug}.teamstitch.com
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

            {<p>{this.props.invalidLogin}</p>}

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
        </div>

        <div className="text-center">
          <a
            className="cancel-login"
            href={`https://${applicationHost}/signin/`}
          >
            <strong>Sign in to a different team</strong>
          </a>
        </div>
      </div>
    );
  }
}
