import React, { Component } from "react";
import PropTypes from "prop-types";
import VisibilitySensor from "react-visibility-sensor";
import cx from "classnames";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

import Header from "../components/header";
import Feature from "../components/feature";
import Footer from "../components/footer";

export default class Manage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      setupVisible: false
    };
  }

  onVisibleChange = isVisible => {
    if (isVisible) {
      this.setState({ setupVisible: true });
    }
  };

  render() {
    const { flipped } = this.props;

    const setupClass = cx("get-started-new", {
      visible: this.state.setupVisible
    });

    return (
      <div className="product-page">
        <Header />

        <div className="subheader">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <h4 className="product-heading">
                  <i className="fa fa-tasks" /> Manage
                </h4>

                <h1>Assign, Track and Complete Every Task</h1>

                <h3 className="m-b-30">
                  Stitch Manage is a simple system for tracking tasks. Instantly
                  know what your team is doing and ensure every patient task
                  goes from start to done.
                </h3>

                <Button
                  bsStyle="primary"
                  href="https://teamstitch.typeform.com/to/Yt22AI"
                >
                  Request Access
                </Button>
              </div>

              <div className="flex-item">
                <img
                  src="/images/manage-header.png"
                  alt="Stitch Platform"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Assign and track every task for your patients"
          image="/images/manage-feature-1-alt.png"
        >
          Stitch Manage lets you quickly turn clinical work into tasks your team
          needs to complete. Easily add new tasks and assign them to right team
          member. Use due dates and notifications to stay in the loop on
          progress, so you can deliver great patient care 100% of the time.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Instantly know the status for any patient"
          image="/images/manage-feature-2.png"
        >
          Stitch lets you visualize outstanding and completed tasks for any
          patient at a glance. Click on any patient to instantly understand
          their status, and see which team members are involved in their care.
          Easily handle patient inquiries regarding status of their care.
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Collaborate with your team on any task"
          image="/images/manage-feature-3.png"
        >
          Collaborate with colleagues through comments on tasks. Create ongoing
          discussions that loop team members in so everyone stays on the same
          page. Never again lose track of a conversation or duplicate work. Take
          advantage of notifications to track conversations that matter to you.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Keep everything you need in one place"
          image="/images/manage-feature-4.png"
        >
          Consolidate your work streams in a single place; no more sticky notes,
          spread sheets or forgotten hallway chats to coordinate patient care.
          Moreover, progress notes, file uploads, lab results, referrals and
          prescriptions can all be added to patient tasks to create a single
          source of truth.
        </Feature>

        <div className="additional-features">
          <div className="container">
            <h2>Everything you need to manage your patients</h2>

            <Row>
              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-bar-chart" /> Analytics
                  </h4>
                  <p className="m-b-15">
                    Get insight on task completion and work speed rates for each
                    team member from our intuitive graphs.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-refresh" /> Workflows
                  </h4>
                  <p className="m-b-15">
                    Create pre-defined workflows you can apply with the click of
                    a button, accessible to your entire team.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-bell" /> Notifications
                  </h4>
                  <p className="m-b-15">
                    Know when a task is complete or overdue, and stay in the
                    loop on any threads you’re following.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-calendar-check-o" /> Due Dates
                  </h4>
                  <p className="m-b-15">
                    Give every task a due date, so you can visualize the
                    workload of your entire team and plan accordingly.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-comments" /> Comments
                  </h4>
                  <p className="m-b-15">
                    Use comments to thread discussions on any task, creating a
                    care record accessible to any team member.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-upload" /> File Uploads
                  </h4>
                  <p className="m-b-15">
                    Attach files of any kind to patient tasks, so you can keep
                    everything related to patient care in a single place.
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <VisibilitySensor
          active
          onChange={this.onVisibleChange}
          scrollCheck
          partialVisibility
        >
          <div className={setupClass}>
            <div className="setup-line" />
            <div className="container">
              <h2>Simple setup in under 5 minutes</h2>

              <div className="steps">
                <Panel className="step-1">
                  <Panel.Body>
                    <div className="number m-b-30">1</div>
                    <h4 className="m-b-20">Create an account</h4>

                    <p>
                      Stitch is 100% free to start. Pick a team name and a
                      custom URL you can use to access Stitch easily.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-2">
                  <Panel.Body>
                    <div className="number m-b-30">2</div>
                    <h4 className="m-b-20">Invite your team</h4>
                    <p>
                      Stitch works best when your entire team is inside. Use
                      Stitch with an unlimited number of users.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-3">
                  <Panel.Body>
                    <div className="number m-b-30">3</div>
                    <h4 className="m-b-20">Add your tasks</h4>
                    <p>
                      Add and assign tasks your team needs to complete. You can
                      add an unlimited number of tasks.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-4">
                  <Panel.Body>
                    <div className="number m-b-30">4</div>
                    <h4 className="m-b-20">Work efficiently</h4>
                    <p>
                      Start completing tasks and collaborating with your
                      colleagues. Access analytics for deep insight.
                    </p>
                  </Panel.Body>
                </Panel>
              </div>

              <div className="text-center">
                <Button
                  bsStyle="primary"
                  href="https://teamstitch.typeform.com/to/Yt22AI"
                >
                  Request Access
                </Button>
              </div>
            </div>
          </div>
        </VisibilitySensor>

        <Footer />
      </div>
    );
  }
}

Manage.propTypes = {
  flipped: PropTypes.bool
};

Manage.defaultProps = {
  flipped: false
};
