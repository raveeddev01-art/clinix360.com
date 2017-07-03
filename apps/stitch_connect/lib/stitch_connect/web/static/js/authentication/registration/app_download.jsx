import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

@observer
export default class AppDownload extends Component {
  constructor(props) {
    super();
  }

  render() {
    return (
      <div className="authentication-card download-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={12} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Launch</Tooltip>}
              >
                <Link to="/">
                  <i className="fa fa-sign-in" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h1>Desktop App</h1>

        <h5>
          Download our desktop app for <strong>Mac</strong> and{" "}
          <strong>Windows</strong>.
        </h5>

        <Row>
          <Col sm={5} smOffset={1}>
            <a href="#">
              <img
                src="https://app.teamstitch.com/img/dl-mac.png"
                alt=""
                className="os-icon"
              />
            </a>
            <h3>Mac</h3>
            <p className="text-muted">Requires 10.8 or Newer</p>
            <Button
              bsSize="lg"
              bsStyle="primary"
              className="btn-download m-b-40"
            >
              Download
            </Button>
          </Col>

          <Col sm={5}>
            <a href="#">
              <img
                src="https://app.teamstitch.com/img/dl-win.png"
                alt=""
                className="os-icon"
              />
            </a>
            <h3>Windows</h3>
            <p className="text-muted">Requires Windows 7 or Newer</p>
            <Button
              bsSize="lg"
              bsStyle="primary"
              className="btn-download m-b-40"
            >
              Download
            </Button>
          </Col>
        </Row>

        <a
          href={`https://${store.instance.teamSlug}.localhost:4443`}
          className="btn btn-lg btn-default m-b-40"
        >
          Skip & Launch
        </a>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
