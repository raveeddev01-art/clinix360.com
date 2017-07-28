import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Grid, Row, Col, Button } from "react-bootstrap";

import Sidebar from "./sidebar.jsx";
import TeamHipaa from "./team/hipaa.jsx";
import TeamExport from "./team/export.jsx";
import TeamSettings from "./team/settings/index.jsx";
import TeamStore from "./stores/team_store";
import YouNotifications from "./you/notifications.jsx";
import UsersInvitations from "./users/invitations.jsx";

export default class Admin extends Component {
  constructor(props) {
    super(props);
    TeamStore.instance = props;
  }

  render() {
    return (
      <Router>
        <div className="admin-wrapper container">
          <Grid>
            <Row>
              <Col xs={3}>
                <Button
                  block
                  bsSize="large"
                  className="back-btn m-b-20"
                  href={`https://${TeamStore.instance
                    .subdomain}.${applicationHost}`}
                >
                  Back to chat
                </Button>

                <Sidebar />
              </Col>
              <Col xs={9}>
                <Switch>
                  <Route exact path={`/admin/team`} component={TeamSettings} />
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
                    path={`/admin/users/invitations`}
                    component={UsersInvitations}
                  />
                </Switch>
              </Col>
            </Row>
          </Grid>
        </div>
      </Router>
    );
  }
}
