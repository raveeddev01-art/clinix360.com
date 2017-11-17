import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { alert } from "common/modals";

import TeamName from "../components/team-name-card/team-name-card";
import TeamUrl from "../components/team-url-card/team-url-card";
import FirstName from "../components/first-name-card/first-name-card";
import LastName from "../components/last-name-card/last-name-card";
import PhoneNumber from "../components/phone-number-card/phone-number-card";
import Username from "../components/username-card/username-card";
import Password from "../components/password-card/password-card";
import Pin from "../components/pin-card/pin-card";
import Invites from "../components/invites-card/invites-card";
import Hipaa from "../components/hipaa-card/hipaa-card";

const stepList = [
  { field: "teamName", component: TeamName },
  { field: "teamUrl", component: TeamUrl },
  { field: "firstName", component: FirstName },
  { field: "lastName", component: LastName },
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
  constructor(props) {
    super(props);

    this.state = {
      step: 0
    };
  }

  onSave = () => {
    const { registrationStore } = this.props;
    registrationStore.createTeam().catch(() => {
      alert({
        title: "Error in creating team",
        message:
          "Sorry, we had an issue completing your onboarding. Could you please start over?",
        okLabel: "Restart"
      }).then(() => {
        this.setState({ step: 0 });
      });
    });
  };

  render() {
    const { step } = this.state;
    const { registrationStore } = this.props;
    return React.createElement(stepList[step].component, {
      onNext: value => {
        if (stepList.length <= step + 1) {
          this.onSave();
        } else {
          if (typeof value === "object") {
            Object.assign(registrationStore, value);
          } else {
            registrationStore[stepList[step].field] = value;
          }

          this.setState({ step: step + 1 });
        }
      },
      saving: registrationStore.saving
    });
  }
}

export default Onboarding;
