import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import Button from "react-bootstrap/lib/Button";

import { AuthenticationPage, PasswordValidator } from "common/components";

@inject("resetPasswordStore", "titleStore")
@observer
class SetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      error: false,
      formValid: false,
      showPassword: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Reset Password");
  }

  onChange = evt => {
    this.setState({
      password: evt.target.value
    });
  };

  onChangeValid = formValid => {
    this.setState({ formValid });
  };

  _onSubmit = evt => {
    evt.preventDefault();
    this.setState({ error: false });
    this.props.resetPasswordStore
      .resetPassword(this.state.password, this.props.asPatient)
      .then(() => {
        if (this.props.asPatient) {
          window.location.href = "/patient/login";
        } else {
          this.props.history.push("/login", { passwordReset: true });
        }
      })
      .catch(err => {
        this.setState({
          error:
            err.data && err.data.errors && err.data.errors.password
              ? err.data.errors.password[0]
              : "Unknown server error"
        });
      });
  };

  togglePasswordShow = () => {
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword
    });
  }

  render() {
    const { password, error } = this.state;
    return (
      <AuthenticationPage
        headerCTA="create"
        title="Reset Password"
        errorText={error}
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
      >
        <Form onSubmit={this._onSubmit}>
          <FormGroup 
            bsSize="large" 
            className="password-formgroup"
          >
            <FormControl
              required
              autoFocus
              name='password'
              autoComplete="off"
              type={this.state.showPassword ? "text" : "password"}
              placeholder="Password"
              maxLength={80}
              value={password}
              onChange={this.onChange}
            />
            <div className="password-icon" onClick={this.togglePasswordShow}>
              <i className={this.state.showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} />
            </div>
          </FormGroup>
          <PasswordValidator
            password={password}
            onChangeValid={this.onChangeValid}
          />
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
            disabled={this.state.formValid}
          >
            Submit
          </Button>
        </Form>
      </AuthenticationPage>
    );
  }
}

SetPassword.defaultProps = {
  asPatient: false
};

SetPassword.propTypes = {
  asPatient: PropTypes.bool
};

export default SetPassword;
