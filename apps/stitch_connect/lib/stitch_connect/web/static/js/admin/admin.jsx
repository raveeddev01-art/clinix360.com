import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Grid, Row, Col, Button } from "react-bootstrap";
import classNames from 'classnames';

import Sidebar from "./sidebar";
import Topbar from "./topbar";
import TeamSecurity from "./team/security";
import TeamSettings from "./team/settings/index";
import YouNotifications from "./you/notifications";
import ProfileSettings from "./you/profile/index";
import AccountSettings from "./you/account/index";
import UsersInvitations from "./users/invitations";
import UsersMembers from "./users/members";
import UsersPending from "./users/pending";

import userStore from "./stores/user_store";
import teamStore from "./stores/team_store";
import imageStore from "./stores/image_store";
import membersStore from "./stores/members_store";
import invitationStore from "./stores/invitation_store";
import notificationStore from "./stores/notification_store";

const stores = {
  userStore,
  teamStore,
  imageStore,
  invitationStore,
  membersStore,
  notificationStore
};

export default class Admin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarOpened: false
    };
  }

  componentWillMount() {
    notificationStore.loadPreferences();
    membersStore.loadUsers(this.props.teamId);
    teamStore.loadTeam(this.props.teamId);
    userStore.loadUser(currentUser.id);
  }

  toggleSidebar = () => {
    this.setState({
      sidebarOpened: !this.state.sidebarOpened
    });
  };

  hideSidebar = () => {
    this.setState({
      sidebarOpened: false
    });
  };

  render() {
    const wrapperClassName = classNames('admin-wrapper', {
      'sidebar-opened': this.state.sidebarOpened
    });

    return (
      <Router>
        <Provider {...stores}>
          <div className={wrapperClassName}>
            <Sidebar />
            <div className="admin-content">
              <Topbar onToggleSidebar={this.toggleSidebar} />
              <div
                className="admin-panel-wrapper"
                onClick={this.hideSidebar}
              >
                <Switch>
                  <Route
                    exact
                    path={`/admin/team`}
                    component={TeamSettings}
                  />
                  <Route
                    path={`/admin/team/settings`}
                    component={TeamSettings}
                  />
                  <Route
                    path={`/admin/team/security`}
                    component={TeamSecurity}
                  />
                  <Route
                    path={`/admin/you/notifications`}
                    component={YouNotifications}
                  />
                  <Route
                    path={`/admin/you/profile`}
                    component={ProfileSettings}
                  />
                  <Route
                    path={`/admin/you/account`}
                    component={AccountSettings}
                  />
                  <Route
                    path={`/admin/users/invitations`}
                    component={UsersInvitations}
                  />
                  <Route
                    path={`/admin/users/members`}
                    component={UsersMembers}
                  />
                  <Route
                    path={`/admin/users/pending`}
                    component={UsersPending}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </Provider>
      </Router>
    );
  }
}
