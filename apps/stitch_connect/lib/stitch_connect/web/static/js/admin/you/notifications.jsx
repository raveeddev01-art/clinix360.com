import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import classNames from 'classnames';
import {
  Panel,
  Well,
  HelpBlock,
  Col,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Modal
} from "react-bootstrap";

import SettingPanel from "../components/setting-panel/setting-panel.jsx";

export default class YouNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  _save = () => {
    console.log("Yeah boi");
  };

  _enableNotification = () => {
    const component = this;
    if (Notification.permission !== "denied") {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          component.toggleModal();
        }
      });
    }
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    })
  }

  render() {
    const permissionGranted = Notification.permission === "granted";
    return (
      <Panel className="admin-panel">
        <h1 className="text-center">Notifications</h1>

        <h3 className="m-b-20">Desktop Notifications</h3>

        <Well>
          <i className={classNames('fa', 'fa-bell', { 'text-muted': !permissionGranted })} />
          <p className="m-b-0">
            Desktop notifications are currently
            <strong className={classNames({ 'text-muted': !permissionGranted })}>
              {permissionGranted ? ' enabled' : ' not enabled'}
            </strong>. 
            You will receive notifications in this browser.
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
        
        {!permissionGranted && <div className="clearfix">
            <Button 
              bsStyle="primary" 
              className="pull-right"
              onClick={this._enableNotification}
            >
              Enable Desktop Notifications
            </Button>
          </div>
        }

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

        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Great! Notifications are now enabled.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.toggleModal}>OK</Button>
          </Modal.Footer>
        </Modal>
      </Panel>
    );
  }
}
