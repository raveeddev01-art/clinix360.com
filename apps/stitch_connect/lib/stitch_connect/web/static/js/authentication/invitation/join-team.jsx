import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { alert } from "common/modals";
import { withRouter, Redirect } from "react-router-dom";

import NameInput from "../components/name-card/name-card";
import PhoneNumber from "../components/phone-number-card/phone-number-card";
import Username from "../components/username-card/username-card";
import Password from "../components/password-card/password-card";
import Pin from "../components/pin-card/pin-card";

const stepList = [
  { field: "name", component: NameInput },
  { field: "phone", component: PhoneNumber },
  { field: "username", component: Username },
  { field: "password", component: Password },
  { field: "pin", component: Pin }
];

@inject("invitationStore")
@observer
class JoinTeam extends Component {
  componentWillMount() {
    const { invitationStore, history } = this.props;
    if (!invitationStore.token) {
      history.replace(`/invitations/error`);
    }

    if (!invitationStore.verified) {
      history.replace(`/invitations/accept/${invitationStore.token}`);
    }
  }

  onSave = () => {
    const { invitationStore, history } = this.props;
    invitationStore.completeInvitation().catch(() => {
      alert({
        title: "Error in joining team",
        message:
          "Sorry, we had an issue completing your onboarding. Could you please start over?",
        okLabel: "Restart"
      }).then(() => {
        history.push(
          `/invitations/accept/${invitationStore.token}/${stepList[0].field}`
        );
      });
    });
  };

  render() {
    const {
      invitationStore,
      match: { params: { currentStep } },
      history
    } = this.props;
    const stepIndex = stepList.findIndex(s => s.field === currentStep);

    if (stepIndex === -1) {
      return <Redirect to={`/invitations/accept/${invitationStore.token}`} />;
    }

    return React.createElement(stepList[stepIndex].component, {
      onNext: value => {
        if (typeof value === "object") {
          Object.assign(invitationStore, value);
        } else {
          invitationStore[currentStep] = value;
        }

        if (stepList.length <= stepIndex + 1) {
          this.onSave();
        } else {
          history.push(
            `/invitations/accept/${invitationStore.token}/${stepList[
              stepIndex + 1
            ].field}`
          );
        }
      },
      saving: invitationStore.saving
    });
  }
}

export default withRouter(JoinTeam);
