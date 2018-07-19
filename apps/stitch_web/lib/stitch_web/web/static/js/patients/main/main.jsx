import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import Scrollbar from "common/components/scrollbar";

@inject("patientsStore")
@observer
class Main extends Component {
  render() {
    const { patientsStore: { currentPatient } } = this.props;
    return (
      <div className="info-panel">
        <Scrollbar
          className="scrollbar"
          viewRef={ref => {
            this.scrollbar = ref;
          }}
        >
          <h1>{currentPatient.full_name}</h1>

          <h4>Profile</h4>
          <div className="card">
            <Row className="profile-row">
              <Col sm={3}>
                <div className="text-muted">First Name</div>
              </Col>
              <Col sm={9}>{currentPatient.first_name}</Col>
            </Row>

            <Row className="profile-row">
              <Col sm={3}>
                <div className="text-muted">Last Name</div>
              </Col>
              <Col sm={9}>{currentPatient.last_name}</Col>
            </Row>

            <Row className="profile-row">
              <Col sm={3}>
                <div className="text-muted">MRN</div>
              </Col>
              <Col sm={9}>{currentPatient.mrn}</Col>
            </Row>

            <Row className="profile-row">
              <Col sm={3}>
                <div className="text-muted">Email</div>
              </Col>
              <Col sm={9}>{currentPatient.email}</Col>
            </Row>

            <Row className="profile-row">
              <Col sm={3}>
                <div className="text-muted">Phone</div>
              </Col>
              <Col sm={9}>{currentPatient.phone}</Col>
            </Row>
          </div>

          <h4>Timeline</h4>
          <div className="card">
            <div className="timeline">
              <div className="item">
                <div className="dot-holder">
                  <div className="dot" />
                </div>

                <div className="description">
                  <a role="button" className="btn btn-default">
                    Send Message
                  </a>
                  <a role="button" className="btn btn-default">
                    Add Note
                  </a>
                  <a role="button" className="btn btn-default">
                    Create Task
                  </a>
                  <a role="button" className="btn btn-default">
                    Upload File
                  </a>
                </div>
              </div>

              <div className="item">
                <div className="dot-holder">
                  <div className="dot" />
                </div>

                <div className="description">
                  <div className="icon">
                    <i className="fa fa-bullhorn" />
                  </div>

                  <div className="content">
                    <div className="action">Appoint requested</div>
                    <div className="text-muted">Started on May 30, 2018</div>
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="dot-holder">
                  <div className="dot" />
                </div>

                <div className="description">
                  <div className="icon">
                    <i className="fa fa-user-plus" />
                  </div>

                  <div className="content">
                    <div className="action">Account created</div>
                    <div className="text-muted">Created on May 19, 2018</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Scrollbar>
      </div>
    );
  }
}

export default Main;
