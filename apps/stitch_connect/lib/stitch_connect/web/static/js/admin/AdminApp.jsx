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
  componentWillMount() {
    notificationStore.loadPreferences();
    membersStore.loadUsers(this.props.teamId);
    teamStore.loadTeam(this.props.teamId);
    userStore.loadUser(currentUser.id);
  }

  render() {
    return (
      <div className="admin-wrapper container">
        <Grid>
          <Row>
            <Col xs={3}>
              <Button
                block
                bsSize="large"
                className="back-btn m-b-20"
                href={`https://${this.props.subdomain}.${applicationHost}`}
              >
                Back to chat
              </Button>

              <Sidebar />
            </Col>
            <Col xs={9}>
              <Switch>
                <Route exact path={`/admin/team`} component={TeamSettings} />
                <Route path={`/admin/team/settings`} component={TeamSettings} />
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
                <Route path={`/admin/users/members`} component={UsersMembers} />
                <Route path={`/admin/users/pending`} component={UsersPending} />
              </Switch>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default AdminApp;
