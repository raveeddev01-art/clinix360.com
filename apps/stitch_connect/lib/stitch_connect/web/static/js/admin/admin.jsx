import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Grid, Row, Col, Button } from "react-bootstrap";

import Sidebar from "./sidebar.jsx";
import TeamHipaa from "./team/hipaa.jsx";
import TeamExport from "./team/export.jsx";
import TeamSettings from "./team/settings/index.jsx";
import YouNotifications from "./you/notifications.jsx";
import ProfileSettings from "./you/profile/index.jsx";
import AccountSettings from "./you/account/index.jsx";
import UsersInvitations from "./users/invitations.jsx";
import UsersMembers from "./users/members.jsx";
import UsersPending from "./users/pending.jsx";

import userStore from "./stores/user_store";
import teamStore from "./stores/team_store";
import imageStore from "./stores/image_store";

const stores = { userStore, teamStore, imageStore };

export default class Admin extends Component {
  componentWillMount() {
    teamStore.loadTeam(this.props.teamId);
    userStore.loadUser(currentUser.id);
  }

  render() {
    return (
      <Router>
        <Provider {...stores}>
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
                </Col>
              </Row>
            </Grid>
          </div>
        </Provider>
      </Router>
    );
  }
}
