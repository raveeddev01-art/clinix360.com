import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { alert } from "common/modals";
import { withRouter, Redirect } from "react-router-dom";

import TeamName from "../components/team-name-card/team-name-card";
import TeamUrl from "../components/team-url-card/team-url-card";
import NameInput from "../components/name-card/name-card";
import PhoneNumber from "../components/phone-number-card/phone-number-card";
import Username from "../components/username-card/username-card";
import Password from "../components/password-card/password-card";
import Pin from "../components/pin-card/pin-card";
import Invites from "../components/invites-card/invites-card";
import Hipaa from "../components/hipaa-card/hipaa-card";

const stepList = [
  { field: "teamname", component: TeamName },
  { field: "teamurl", component: TeamUrl },
  { field: "name", component: NameInput },
  { field: "phone", component: PhoneNumber },
  { field: "username", component: Username },
  { field: "password", component: Password },
  { field: "pin", component: Pin },
  { field: "invites", component: Invites },
  { field: "hipaa", component: Hipaa }
];

@inject("registrationStore")
@observer
class Onboarding extends Component {
  componentWillMount() {
    const { registrationStore, history } = this.props;
    if (!registrationStore.verifyCookie()) {
      history.replace(`/signup/email`);
    }

    if (!registrationStore.verified) {
      history.replace(`/signup/confirmation-code`);
    }
  }

  onSave = () => {
    const { registrationStore, history } = this.props;
    registrationStore.createTeam().catch(() => {
      alert({
        title: "Error in creating team",
        message:
          "Sorry, we had an issue completing your onboarding. Could you please start over?",
        okLabel: "Restart"
      }).then(() => {
        history.push(`/signup/onboarding/${stepList[0].field}`);
      });
    });
  };

  render() {
    const {
      registrationStore,
      match: { params: { currentStep } },
      history
    } = this.props;
    const stepIndex = stepList.findIndex(s => s.field === currentStep);

    if (stepIndex === -1) {
      return <Redirect to="/signup/confirmation-code" />;
    }

    return React.createElement(stepList[stepIndex].component, {
      onNext: value => {
        if (stepList.length <= stepIndex + 1) {
          this.onSave();
        } else {
          if (typeof value === "object") {
            Object.assign(registrationStore, value);
          } else {
            registrationStore[currentStep] = value;
          }

          history.push(`/signup/onboarding/${stepList[stepIndex + 1].field}`);
        }
      },
      saving: registrationStore.saving
    });
  }
}

export default withRouter(Onboarding);
