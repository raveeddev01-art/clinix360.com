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
      <div className="admin-wrapper container">
        <Grid>
          <Row>
            <Col xs={3}>
              <Button
                block
                bsSize="large"
                className="back-btn m-b-20"
                onClick={this.toChat}
              >
                Back to chat
              </Button>

              <Sidebar />
            </Col>
            <Col xs={9}>
              <Switch>
                <Route exact path={`/team`} component={TeamSettings} />
                <Route path={`/team/settings`} component={TeamSettings} />
                <Route path={`/team/hipaa`} component={TeamHipaa} />
                <Route path={`/team/export`} component={TeamExport} />
                <Route
                  path={`/you/notifications`}
                  component={YouNotifications}
                />
                <Route path={`/you/profile`} component={ProfileSettings} />
                <Route path={`/you/account`} component={AccountSettings} />
                <Route
                  path={`/users/invitations`}
                  component={UsersInvitations}
                />
                <Route path={`/users/members`} component={UsersMembers} />
                <Route path={`/users/pending`} component={UsersPending} />
              </Switch>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default AdminApp;
