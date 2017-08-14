import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
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

import userStore from "./stores/user_store";
import teamStore from "./stores/team_store";
import imageStore from "./stores/image_store";
import invitationStore from "./stores/invitation_store";

const stores = { userStore, teamStore, imageStore, invitationStore };

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
