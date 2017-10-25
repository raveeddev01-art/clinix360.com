import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class LastName extends Component {
  _onChange = evt => {
    this.props.invitationStore.lastName = evt.target.value;
  };

  render() {
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    return (
      <OnboardCard
        title="Last Name"
        description={
          <span>
            Enter your <strong>last name</strong>.
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
            placeholder="Last Name"
            value={invitationStore.lastName}
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

LastName.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default LastName;
