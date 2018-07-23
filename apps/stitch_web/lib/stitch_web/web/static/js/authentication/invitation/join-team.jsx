import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter, Redirect } from "react-router-dom";

import { alertModal } from "common/modals";
import Names from "../components/names-card/names-card";
import Password from "../components/password-card/password-card";
import Pin from "../components/pin-card/pin-card";

const stepList = [
  { field: "names", component: Names },
  { field: "password", component: Password },
  { field: "pin", component: Pin }
];

const patientStepList = [
  { field: "names", component: Names },
  { field: "password", component: Password }
];

@inject("invitationStore")
@observer
class JoinTeam extends Component {
  componentWillMount() {
    const { invitationStore, history } = this.props;

    if (!invitationStore.token) {
      history.replace(`${this.baseUrl}/error`);
    }

    if (!invitationStore.verified) {
      history.replace(`${this.baseUrl}/accept/${invitationStore.token}`);
    }
  }

  onSave = () => {
    const { invitationStore, history, asPatient } = this.props;
    const resetUrl = `${this.baseUrl}/accept/${invitationStore.token}/${this
      .stepList[0].field}`;

    invitationStore.completeInvitation(asPatient).catch(() => {
      alertModal({
        title: "Error in joining team",
        message:
          "Sorry, we had an issue completing your onboarding. Could you please start over?",
        okLabel: "Restart"
      }).then(() => {
        history.push(resetUrl);
      });
    });
  };

  get stepList() {
    return this.props.asPatient ? patientStepList : stepList;
  }

  get baseUrl() {
    return this.props.asPatient ? "/patient/invitations" : "/invitations";
  }

  render() {
    const {
      invitationStore,
      match: { params: { currentStep } },
      history
    } = this.props;
    const stepIndex = this.stepList.findIndex(s => s.field === currentStep);

    if (stepIndex === -1) {
      const redirectUrl = `${this.baseUrl}/accept/${invitationStore.token}`;
      return <Redirect to={redirectUrl} />;
    }

    return React.createElement(this.stepList[stepIndex].component, {
      headerCTA: "no-cta",
      asPatient: this.props.asPatient,
      onNext: value => {
        if (typeof value === "object") {
          Object.assign(invitationStore, value);
        } else {
          invitationStore[currentStep] = value;
        }

        if (this.stepList.length <= stepIndex + 1) {
          this.onSave();
        } else {
          const nextUrl = `${this
            .baseUrl}/accept/${invitationStore.token}/${this.stepList[
            stepIndex + 1
          ].field}`;

          history.push(nextUrl);
        }
      },
      saving: invitationStore.saving
    });
  }
}

JoinTeam.defaultProps = {
  asPatient: false
};

JoinTeam.propTypes = {
  asPatient: PropTypes.bool
};

export default withRouter(JoinTeam);
