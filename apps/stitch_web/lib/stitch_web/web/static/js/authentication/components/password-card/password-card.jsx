import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardPage, PasswordValidator } from "common/components";
import { mobile } from "../../../lib/browser_details";

class PasswordCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      password: "",
      formInvalid: true,
      type: 'password'
    };
  }

  _onChange = evt => {
    this.setState({
      password: evt.target.value
    });
  };

  _onChangeValid = formInvalid => {
    this.setState({ formInvalid });
  };

  _onNext = () => {
    if (!this.state.formInvalid) {
      this.props.onNext(this.state.password);
    }
  };

  showHide = () => {
    this.setState({
        type: this.state.type === 'text' ? 'password' : 'text'
    });
  }

  render() {
    const { password, formInvalid } = this.state;
    return (
      <div>
        <OnboardPage
          {...this.props}
          title="Set your password"
          description="Select a password for signing into InvoChat."
          onNext={this._onNext}
          disableNext={formInvalid}
        >
          <FormGroup bsSize="large" className="password-formgroup">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              required
              autoFocus={!mobile}
              name={`password_${new Date().getTime()}`}
              autoComplete="off"
              type={this.state.type}
              placeholder="Password"
              maxLength={80}
              value={password}
              onChange={this._onChange}
            />
            <div className="password-icon" onClick={this.showHide}>
              <i className={this.state.type === 'text' ? 'fa fa-eye' : 'fa fa-eye-slash'} />
            </div>
          </FormGroup>
          <PasswordValidator
            password={password}
            onChangeValid={this._onChangeValid}
          />
        </OnboardPage>
      </div>
    );
  }
}

PasswordCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

PasswordCard.defaultProps = {
  onNext: () => {}
};

export default PasswordCard;
