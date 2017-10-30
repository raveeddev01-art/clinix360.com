import React, { Component } from "react";
import PropTypes from "prop-types";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import OnboardCard from "../onboard-card/onboard-card";
import PasswordValidator from "../../../common/components/password-validator/index";

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
      <OnboardCard
        {...this.props}
        title="Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
        onNext={this._onNext}
        disableNext={!formValid}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
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
    );
  }
}

PasswordCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

PasswordCard.defaultProps = {
  onNext: () => {},
  backUrl: "",
  restartUrl: ""
};

export default PasswordCard;
