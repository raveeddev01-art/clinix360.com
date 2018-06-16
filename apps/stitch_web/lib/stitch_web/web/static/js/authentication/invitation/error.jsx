import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import { AuthenticationPage } from "common/components";

@inject("invitationStore")
@observer
class InvalidInvite extends Component {
  componentWillMount() {
    const { invitationStore } = this.props;
    invitationStore.verifyInvitation();
  }

  onNext = () => {
    const { history, invitationStore } = this.props;
    history.push(`/invitations/accept/${invitationStore.token}/firstname`);
  };

  render() {
    return (
      <AuthenticationPage
        title="Invalid Invite"
        description={
          <span>
            It seems like the invitation you are trying to accept is invalid,
            because you joined the team already or your invitation has been
            revoked. Try contacting your carespace administrator for more
            information.
          </span>
        }
      >
        <a
          href="/"
          className="btn btn-onboarding btn-lg btn-block btn-primary m-b-40"
        >
          Back
        </a>
      </AuthenticationPage>
    );
  }
}

export default withRouter(InvalidInvite);
