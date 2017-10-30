import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import PasswordValidator from "../../common/components/password-validator/index";
import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class PasswordCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      formValid: false
    };
  }

  _onChange = evt => {
    this.props.invitationStore.password = evt.target.value;
  };

  _onChangeValid = formValid => {
    this.setState({ formValid });
  };

  render() {
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    const { formValid } = this.state;
    return (
      <OnboardCard
        title="Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
        onNext={onNext}
        onBack={onBack}
        onRestart={onRestart}
        disableNext={formValid}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            type="password"
            placeholder="Password"
            value={invitationStore.password}
            onChange={this._onChange}
          />
        </FormGroup>
        <PasswordValidator
          password={invitationStore.password}
          onChangeValid={this._onChangeValid}
        />
      </OnboardCard>
    );
  }
}

PasswordCard.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default PasswordCard;
