import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Grid, Row, Col, Button } from "react-bootstrap";

import Sidebar from "./sidebar";
import TeamHipaa from "./team/hipaa";
import TeamExport from "./team/export";
import TeamSettings from "./team/settings/index";
import YouNotifications from "./you/notifications";
import ProfileSettings from "./you/profile/index";
import AccountSettings from "./you/account/index";
import UsersInvitations from "./users/invitations";
import UsersMembers from "./users/members";
import UsersPending from "./users/pending";

class AdminApp extends Component {
  toChat = () => {
    const { history } = this.props;

    history.push("/");
  };

  render() {
    return (
      <div className="admin-wrapper">
        <Sidebar />
        <div className="admin-content">
          <Topbar />
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
            <Route path={`/admin/team/hipaa`} component={TeamHipaa} />
            <Route path={`/admin/team/export`} component={TeamExport} />
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
    );
  }
}

export default AdminApp;
