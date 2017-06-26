import React, { Component } from "react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

export default class AppDownload extends Component {
  render() {
    return (
      <div className="authentication-card download-card text-center">
        <h1>Desktop App</h1>

        <h5>Download our desktop app for <strong>Mac</strong> and <strong>Windows</strong>.</h5>

        <Row>
          <Col sm={5} smOffset={1}>
            <a href="#">
              <img src="https://app.teamstitch.com/img/dl-mac.png" alt="" className="os-icon"/>
            </a>
            <h3>Mac</h3>
            <p className="text-muted">Requires 10.8 or Newer</p>
            <Button bsStyle="primary">Download</Button>
          </Col>

          <Col sm={5}>
            <a href="#">
              <img src="https://app.teamstitch.com/img/dl-win.png" alt="" className="os-icon"/>
            </a>
            <h3>Windows</h3>
            <p className="text-muted">Requires Windows 7 or Newer</p>
            <Button bsStyle="primary">Download</Button>
          </Col>
        </Row>

        <Button className="btn-skip">Skip & Launch</Button>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}