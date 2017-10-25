import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class FirstName extends Component {
  _onChange = evt => {
    this.props.invitationStore.firstName = evt.target.value;
  };

  render() {
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    return (
      <OnboardCard
        title="First Name"
        description={
          <span>
            Enter your <strong>first name</strong>.
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
            type="text"
            placeholder="First Name"
            value={invitationStore.firstName}
            onChange={this._onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          Your name will be shown next to your profile and messages.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

FirstName.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default FirstName;
