import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import { withRouter, Switch, Route } from "react-router-dom";

import Welcome from "./welcome";
import JoinTeam from "./join-team";

@inject("titleStore", "invitationStore")
class Invitation extends Component {
  componentWillMount() {
    const { titleStore, invitationStore } = this.props;
    titleStore.setPageName("Join Team");

    invitationStore.token = this.props.inviteToken;
    if (!this.props.inviteToken) {
      this.props.history.push(`/invitations/error`);
    }

    invitationStore.teamName = this.props.teamName;
    invitationStore.subdomain = this.props.subdomain;
  }

  render() {
    return (
      <Switch>
        <Route exact path="/invitations/accept/:token" component={Welcome} />
        <Route
          exact
          path="/invitations/accept/:token/:currentStep"
          component={JoinTeam}
        />
      </Switch>
    );
  }
}

Invitation.propTypes = {
  teamName: PropTypes.string.isRequired,
  subdomain: PropTypes.string.isRequired,
  inviteToken: PropTypes.string.isRequired
};

export default withRouter(Invitation);
