import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";

import { Card } from "common/components";

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
    const { history, invitationStore } = this.props;
    history.push(`/invitations/accept/${invitationStore.token}/firstname`);
  };

  render() {
    const { invitationStore } = this.props;
    return (
      <Card
        title="Welcome!"
        description={
          <span>
            Time to join the <strong>{invitationStore.teamName}</strong> team.
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
      </Card>
    );
  }
}

export default withRouter(Welcome);
