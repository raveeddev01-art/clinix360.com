import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import { Card } from "common/components";

@inject("invitationStore")
@observer
class Welcome extends Component {
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
      <Card
        title="Invalid Invite"
        description={
          <span>
            It seems like the invitation you are trying to accept is invalid or
            has been revoked.
            <br />
            Try contacting your team administrator.
          </span>
        }
      >
        <a href="/" className="btn btn-lg btn-block btn-primary m-b-40">
          Back
        </a>
      </Card>
    );
  }
}

export default withRouter(Welcome);
