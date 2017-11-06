import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class Pin extends Component {
  _onChange = evt => {
    this.props.invitationStore.pin = evt.target.value;
  };

  render() {
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    return (
      <OnboardCard
        title="PIN"
        description={
          <span>
            Enter a <strong>4-digit pin</strong>.
          </span>
        }
        onNext={onNext}
        onBack={onBack}
        onRestart={onRestart}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            type="password"
            placeholder="0000"
            value={invitationStore.pin}
            onChange={this._onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          You can use this pin when your screen is locked after a period of
          inactivity.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

Pin.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default Pin;
