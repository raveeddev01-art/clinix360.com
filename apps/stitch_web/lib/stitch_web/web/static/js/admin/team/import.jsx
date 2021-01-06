import React, { Component } from "react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

import SettingPanel from "../components/setting-panel/setting-panel";

const title = "Import Data";
const description =
  "Import data from other services or InvoCom teams. Click 'Request Access' and we'll follow up with next steps.";

export default class TeamImport extends Component {
  _mailToFor = (app) => {
    return `mailto:support@dvlcloud.com?subject=Import Data from ${app}&body=We would like to import data from ${app} to InvoCom.`;
  };

  render() {
    return (
      <SettingPanel saveButtonText="" title={title} description={description}>
        <br />
        <Row className="m-b-20">
          <Col md={10} className="import-app-option">
            <img src="/images/logo-blue.svg" alt="InvoCom logo" />
            <div>
              <h4>
                <strong>InvoCom</strong>
              </h4>
              <p>Import your message history and files.</p>
            </div>
          </Col>
          <Col md={2}>
            <Button
              className="import-app-button"
              href={this._mailToFor("InvoCom")}
              block
              bsStyle="primary"
            >
              Request Import
            </Button>
          </Col>
        </Row>

        <Row className="m-b-20">
          <Col md={10} className="import-app-option">
            <img src="/images/import-excel-logo.png" />
            <div>
              <h4>
                <strong>CSV/Text File</strong>
              </h4>
              <p>Import messages in a custom format.</p>
            </div>
          </Col>
          <Col md={2}>
            <Button
              className="import-app-button"
              href={this._mailToFor("CSV/Text File")}
              block
              bsStyle="primary"
            >
              Request Import
            </Button>
          </Col>
        </Row>

        <Row className="m-b-20">
          <Col md={10} className="import-app-option">
            <img src="/images/import-slack-logo.png" />
            <div>
              <h4>
                <strong>Slack</strong>
              </h4>
              <p>Import your message history and files.</p>
            </div>
          </Col>
          <Col md={2}>
            <Button
              className="import-app-button"
              href={this._mailToFor("Slack")}
              block
              bsStyle="primary"
            >
              Request Import
            </Button>
          </Col>
        </Row>

        <Row className="m-b-20">
          <Col md={10} className="import-app-option">
            <img src="/images/import-hipchat-logo.png" />
            <div>
              <h4>
                <strong>HipChat</strong>
              </h4>
              <p>Import your message history and files.</p>
            </div>
          </Col>
          <Col md={2}>
            <Button
              className="import-app-button"
              href={this._mailToFor("HipChat")}
              block
              bsStyle="primary"
            >
              Request Import
            </Button>
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}
