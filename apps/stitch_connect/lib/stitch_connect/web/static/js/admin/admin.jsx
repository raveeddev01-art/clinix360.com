import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Grid, Row, Col } from "react-bootstrap";

import Sidebar from "./sidebar.jsx";
import TeamSettings from "./team/settings.jsx";
import TeamHipaa from "./team/hipaa.jsx";

export default class Admin extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div className="admin-wrapper container">
          <Grid>
            <Row>
              <Col xs={3}>
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
                </Switch>
              </Col>
            </Row>
          </Grid>
        </div>
      </Router>
    );
  }
}
