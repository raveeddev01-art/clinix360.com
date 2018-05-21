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
import VideoModal from "../components/video-modal";

export default class Engage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: "",
      setupVisible: false
    };
  }

  onVisibleChange = isVisible => {
    if (isVisible) {
      this.setState({ setupVisible: true });
    }
  };

  videoModal = () => {
    this.setState({
      modal: "video"
    });
  };

  closeModal = () => {
    this.setState({
      modal: ""
    });
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
                  <i className="fa fa-bullhorn" /> Engage
                </h4>

                <h1>Communicate Securely With Patients</h1>

                <h3 className="m-b-30">
                  Stitch Engage is a simple system for talking to your patients.
                  From messages and forms to files and tasks, Stitch lets you
                  engage with patients on every level.
                </h3>

                <Button
                  bsStyle="primary"
                  href="https://teamstitch.typeform.com/to/Ncn8x8"
                >
                  Request Access
                </Button>
              </div>

              <div className="flex-item">
                <img
                  src="/images/engage-header.png"
                  alt="Stitch Platform"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Build great relationships with your patients"
          image="/images/engage-feature-1-alt.png"
        >
          Keep patients connected to your practice through regular
          communication. From followups to appointment reminders, Stitch Engage
          helps you build deep patient relationships. Give your patients a great
          experience, both inside and outside the clinic walls.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Create a shared inbox for your entire team"
          image="/images/engage-feature-2.png"
          imageClassName="engage-feature-image-2"
        >
          No more siloed conversations in individual mailboxes. Team members in
          Stitch Engage can jump into and out of patient conversations as
          necessary, consolidating various patient communication streams into a
          single place for improved coordination and transparency.
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Collect and share information with your patients"
          image="/images/engage-feature-3.png"
        >
          Send messages and share data of any kind — prescriptions, lab results
          and more. Upload almost any type of file — JPEG, PNG, PDF, MP3. Create
          and collect custom response forms. No more faxing or mailing your
          patients files. Just easily send them through Stitch Engage to deliver
          your patients a seamless experience.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="See more patient visits through telehealth video"
          image="/images/engage-feature-4.png"
        >
          Experience Engage as a complete telemedicine platform for delivering
          care to your patients. Schedule video calls and conduct them from
          directly within Stitch. Give patients great care wherever they want,
          in the office or in the home.
        </Feature>

        <div className="additional-features">
          <div className="container">
            <h2>Everything you need to engage your patients</h2>

            <Row>
              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-folder-open" /> Forms
                  </h4>
                  <p className="m-b-15">
                    Never use paper again. Create custom forms you can send and
                    collect via Stitch, from intake to waiver.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-video-camera" /> Video Calls
                  </h4>
                  <p className="m-b-15">
                    Start seeing patients over video. Bring telehealth to your
                    practice to boost patient revenue and satisfaction.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-credit-card" /> Payments
                  </h4>
                  <p className="m-b-15">
                    Collect payments from your patients, hassle free. Create a
                    charge using Stitch so patients can pay by card in-app.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-calendar-check-o" /> Scheduling
                  </h4>
                  <p className="m-b-15">
                    Decrease administrative overhead and increase patient
                    satisfaction by offering self-service appointment booking.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-commenting" /> Live Chat
                  </h4>
                  <p className="m-b-15">
                    Let visitors to your website instantly reach you. Answer
                    questions and drive new appointments using live chat.
                  </p>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-file-text" /> Content
                  </h4>
                  <p className="m-b-15">
                    Stitch offers patient educational content for every
                    specialty, so you can keep patients engaged after visits.
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
                    <h4 className="m-b-20">Add your patients</h4>
                    <p>
                      Upload a list of patients, or manually add each one in.
                      You can add an unlimited number of patients.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-4">
                  <Panel.Body>
                    <div className="number m-b-30">4</div>
                    <h4 className="m-b-20">Message securely</h4>
                    <p>
                      Start sending messages and files to patients, fully HIPAA
                      compliant. Upgrade only when you need to.
                    </p>
                  </Panel.Body>
                </Panel>
              </div>

              <div className="text-center">
                <Button
                  bsStyle="primary"
                  href="https://teamstitch.typeform.com/to/Ncn8x8"
                >
                  Request Access
                </Button>
              </div>
            </div>
          </div>
        </VisibilitySensor>

        <Footer />

        <VideoModal state={this.state.modal} closeModal={this.closeModal} />
      </div>
    );
  }
}

Engage.propTypes = {
  flipped: PropTypes.bool
};

Engage.defaultProps = {
  flipped: false
};
