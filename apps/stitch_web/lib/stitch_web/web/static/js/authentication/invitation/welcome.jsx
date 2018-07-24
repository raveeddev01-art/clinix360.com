import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";

import { AuthenticationPage } from "common/components";

@inject("invitationStore")
@observer
class Welcome extends Component {
  componentWillMount() {
    const { invitationStore } = this.props;
    invitationStore.verifyInvitation().catch(() => {
      history.replace(`/invitations/error`);
    });
  }

  onNext = () => {
    const { history, invitationStore, asPatient } = this.props;
    const url = asPatient
      ? `/patient/invitations/accept/${invitationStore.token}/names`
      : `/invitations/accept/${invitationStore.token}/names`;

    history.push(url);
  };

  render() {
    const { invitationStore } = this.props;
    return (
      <div>
        <AuthenticationPage
          title="Welcome!"
          headerCTA="no-cta"
          description={
            <span>
              Time to join the <strong>{invitationStore.teamName}</strong>{" "}
              carespace.
            </span>
          }
        >
          <p>Your email is:</p>
          <FormGroup bsSize="large">
            <pre>{invitationStore.email}</pre>
          </FormGroup>
          <Button
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
            disabled={!invitationStore.verified}
            onClick={this.onNext}
          >
            Continue
          </Button>
        </AuthenticationPage>
      </div>
    );
  }
}

Welcome.defaultProps = {
  asPatient: false
};

Welcome.propTypes = {
  asPatient: PropTypes.bool
};

export default withRouter(Welcome);
