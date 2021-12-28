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
      formInvalid: true
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
          <FormGroup bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              required
              autoFocus={!mobile}
              name={`password_${new Date().getTime()}`}
              autoComplete="off"
              type="password"
              placeholder="Password"
              maxLength={80}
              value={password}
              onChange={this._onChange}
            />
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
