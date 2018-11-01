import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Alert from "react-bootstrap/lib/Alert";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Cookies from "js-cookie";

import {
  AuthenticationPage,
  LoadingIcon,
  InputErrorBlock
} from "common/components";

@inject("registrationStore", "titleStore")
@observer
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loading: false,
      passwordReset: false,
      errorMessage: ""
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");

    const { location } = this.props;
    if (location.state && location.state.passwordReset === true) {
      this.setState({
        passwordReset: true
      });
    }
  }

  onChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  onSubmit = evt => {
    this.setState({ saving: true });
    evt.preventDefault();
    const { history, asPatient } = this.props;
    const { email, password } = this.state;

    this.setState({ saving: true });

    const loginPath = asPatient ? "/api/v1/patient/login" : "/api/v1/login";

    post(loginPath, {
      body: { email, password },
      hideNotify: true
    })
      .then(response => {
        Cookies.remove("last_activity");
        if (window.electronApp) {
          window.dispatchEvent(new CustomEvent("logged-in"));
          window.location.href = "/";
          return;
        }

        if (response.data.redirect_url === "/apps") {
          history.push(response.data.redirect_url);
        } else {
          window.location = response.data.redirect_url;
        }
      })
      .catch(err => {
        this.setState({
          saving: false,
          passwordReset: false,
          errorMessage: err.data ? err.data.message : err.message
        });
      });
  };

  renderLoadingIcon = () => {
    const { saving } = this.state;

    return saving && <LoadingIcon className="on-right" />;
  };

  renderHelpers = () => {
    if (this.props.asPatient) {
      return (
        <div className="login-helpers">
          <div>
            <Link to="/patient/reset-password"> Forgot your password? </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="login-helpers">
        <div>
          <Link to="/reset-password"> Forgot your password?</Link>
        </div>

        <div>
          <b>Don't have an account with this Carespace?</b>
          <br />
          Contact the Carespace administrator for an invitation.
        </div>

        <div>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            Create a new Carespace.
          </a>
        </div>
      </div>
    );
  };

  render() {
    const { teamName } = this.props.registrationStore;
    return (
      <AuthenticationPage
        headerCTA="create"
        title={`Sign in to ${teamName}`}
        description={
          <span>
            Enter your <b>email address</b> and <b>password</b>.
          </span>
        }
      >
        {this.state.passwordReset && (
          <Alert bsStyle="success">Your password is now reset.</Alert>
        )}
        <Form onSubmit={this.onSubmit}>
          <input type="hidden" name="_csrf_token" value={window.csrfToken} />

          <FormGroup
            bsSize="large"
            validationState={(this.state.errorMessage && "error") || null}
          >
            <FormControl
              name="email"
              required
              autoFocus
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.onChange}
            />
          </FormGroup>

          <FormGroup
            bsSize="large"
            validationState={(this.state.errorMessage && "error") || null}
          >
            <FormControl
              name="password"
              required
              type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.onChange}
            />
          </FormGroup>

          {this.state.errorMessage && (
            <InputErrorBlock> {this.state.errorMessage} </InputErrorBlock>
          )}

          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-lg btn-onboarding btn-block"
          >
            Sign In
            {this.renderLoadingIcon()}
          </Button>
        </Form>

        {this.renderHelpers()}
      </AuthenticationPage>
    );
  }
}

Login.defaultProps = {
  asPatient: false
};

Login.propTypes = {
  asPatient: PropTypes.bool
};

export default withRouter(Login);
