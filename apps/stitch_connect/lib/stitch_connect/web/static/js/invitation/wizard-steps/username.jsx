import React, { Component, PropTypes } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card.jsx";

@inject("invitationStore")
@observer
class Username extends Component {
  _onChange = evt => {
    this.props.invitationStore.username = evt.target.value;
  };

  render() {
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    return (
      <OnboardCard
        title="Username"
        description={
          <span>
            Enter a <strong>username</strong>.
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
            placeholder="Username"
            value={invitationStore.username}
            onChange={this._onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          Your username is how other users will mention you in conversations.
          Pick something familiar.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

Username.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default Username;
