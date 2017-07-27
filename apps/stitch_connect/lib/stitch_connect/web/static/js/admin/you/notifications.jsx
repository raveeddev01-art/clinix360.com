import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
  Panel,
  Well,
  HelpBlock,
  Col,
  Form,
  FormGroup,
  ControlLabel,
  FormControl
} from "react-bootstrap";

import SettingPanel from "../components/setting-panel/setting-panel.jsx";

export default class YouNotifications extends Component {
  constructor(props) {
    super(props);
  }

  _save = () => {
    console.log("Yeah boi");
  };

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="text-center">Notifications</h1>

        <h3 className="m-b-20">Desktop Notifications</h3>

        <Well>
          <i className="fa fa-bell" />
          <p className="m-b-0">
            Desktop notifications are currently <strong>enabled</strong>. You
            will receive notifications in this browser.
          </p>
        </Well>

        <p>
          You can{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us/articles/217052427-In-app-notifications">
            adjust settings
          </a>{" "}
          for each conversation. To disable notifications, open your browser
          settings.
        </p>

        <hr />

        <SettingPanel
          title={"Email Notifications"}
          description={
            "Your email notifications preferences for unread messages."
          }
          onSave={this._save}
        >
          <HelpBlock className="m-b-20">
            Stitch can send an email about new, unread messages you receive
            while you’re offline. You can set the frequency below. You won’t be
            notified twice about the same message.
          </HelpBlock>
          <Form horizontal>
            <FormGroup controlId="emailNotifications">
              <Col componentClass={ControlLabel} md={4}>
                Send email about unread messages:
              </Col>
              <Col sm={4}>
                <FormControl componentClass="select" placeholder="select">
                  <option value="never">Never</option>
                  <option value="minute">Once every 15 minutes</option>
                  <option value="hour">Once every hour</option>
                  <option value="day">Once every day</option>
                </FormControl>
              </Col>
            </FormGroup>
          </Form>
        </SettingPanel>
      </Panel>
    );
  }
}
