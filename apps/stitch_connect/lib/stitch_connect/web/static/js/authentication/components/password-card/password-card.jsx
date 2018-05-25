import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardCard, PasswordValidator } from "common/components";

class PasswordCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      password: "",
      formValid: false
    };
  }

  _onChange = evt => {
    this.setState({
      password: evt.target.value
    });
  };

  _onChangeValid = formValid => {
    this.setState({ formValid });
  };

  _onNext = () => this.props.onNext(this.state.password);

  render() {
    const { password, formValid } = this.state;
    return (
      <div>
        <OnboardCard
          {...this.props}
          title="Set your password"
          description={<span>Select a password for signing into Stitch</span>}
          onNext={this._onNext}
          disableNext={formValid}
        >
          <FormGroup bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              required
              autoFocus
              name={`password_${new Date().getTime()}`}
              autoComplete="off"
              type="password"
              placeholder="Password"
              value={password}
              onChange={this._onChange}
            />
          </FormGroup>
          <PasswordValidator
            password={password}
            onChangeValid={this._onChangeValid}
          />
        </OnboardCard>
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
