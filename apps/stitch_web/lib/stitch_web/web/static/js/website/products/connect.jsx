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

import browserDetails from "../../lib/browser_details";

export default class Connect extends Component {
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
    const { header, flipped, subHeader } = this.props;
    const { mobile, os } = browserDetails;

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
                <h1>{header}</h1>

                <h3 className="m-b-30">{subHeader}</h3>

                <Button bsStyle="primary" href="mailto:feedback@dvlcloud.com?subject=Stitch: Request Information">Request Information</Button>
              </div>

              <div className="flex-item">
                <img
                  src="/images/connect-header.png"
                  alt="InvoChat Platform"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Get to the right person at the right time"
          image="/images/connect-feature-1.png"
        >
          Public and private rooms bring InvoChat teams together for powerful
          team dialogue. Easily discuss patients, events, tasks and more. Direct
          messages enable instant 1-to-1 communication. No more pagers, texting,
          email or phone calls.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Share information across your entire team"
          image="/images/connect-feature-2.png"
        >
          Easily upload files of any type into InvoChat — JPEG, PNG, PDF, MP3,
          Word, Excel, PowerPoint, and more. Make them instantly available to
          your team members, and drop the headache of tedious email attachments.
          Start sharing patient charts, labs, images, intake forms and more.
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Choose notifications that matter to you"
          image="/images/connect-feature-3.png"
        >
          With InvoChat, you can apply custom notification preferences to every
          conversation, so you can stay focused and in the loop. Say goodbye to
          cluttered inboxes, noisy pagers and unruly text threads. Best of all,
          InvoChat goes wherever you go with native Mac, Windows, iOS and Android
          apps.
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Instantly find answers when you need them"
          image="/images/connect-feature-4.png"
        >
          InvoChat turns historical conversations into the ultimate source of
          answers: it’s built from the ground up for deep search. Every message,
          every file, every comment is carefully archived and made searchable.
          Team knowledge at your fingertips, whenever you need it.
        </Feature>

        <div className="additional-features">
          <div className="container">
            <h2>Everything you need to keep your team in sync</h2>

            <Row>
              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-chart-bar" /> Analytics
                  </h4>
                  <p className="m-b-15">
                    View engagement statistics to understand the how, when and
                    who of your team’s InvoChat usage.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/articles/360010902353">
                    Learn more about Analytics
                  </a>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-cogs" /> Security
                  </h4>
                  <p className="m-b-15">
                    Control all the details, like our inactivity lockout
                    interval, password requirements and user invite ability.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/categories/360000720214-Security-and-Compliance">
                    Learn more about Security
                  </a>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-bell" /> Custom Alerts
                  </h4>
                  <p className="m-b-15">
                    Use our group-level alert settings to adjust custom
                    notification settings for each chat room. Never miss a beat.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/articles/360007604194-About-notifications">
                    Learn more about Notifications
                  </a>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-check-circle" /> Read Receipts
                  </h4>
                  <p className="m-b-15">
                    Improve team accountability and reliability with
                    easy-to-access read receipts for every message.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/articles/235554867-Message-info">
                    Learn more about Read Receipts
                  </a>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-users" /> Administration
                  </h4>
                  <p className="m-b-15">
                    Adjust user rights, deactivate stale members, view access
                    logs and create data exports with the click of a button.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/categories/360000723973-Carespace-Administration">
                    Learn more about Administration
                  </a>
                </div>
              </Col>

              <Col sm={6} md={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="far fa-refresh" /> EHR Integrations
                  </h4>
                  <p className="m-b-15">
                    Tie InvoChat into your existing toolset with a seamless EHR
                    integration. Get alerts for key updates right in InvoChat.
                  </p>

                  <a href="https://help.dvlcloud.com/hc/en-us/articles/360007574334-EHR-Integrations">
                    Learn more about Integrations
                  </a>
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
                      InvoChat is 100% free to start. Pick a team name and a
                      custom URL you can use to access InvoChat easily.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-2">
                  <Panel.Body>
                    <div className="number m-b-30">2</div>
                    <h4 className="m-b-20">Invite your team</h4>
                    <p>
                      InvoChat works best when your entire team is inside. Use
                      InvoChat with an unlimited number of users.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-3">
                  <Panel.Body>
                    <div className="number m-b-30">3</div>
                    <h4 className="m-b-20">Add chat rooms</h4>
                    <p>
                      Pick a few major topics that your team talks about
                      frequently, and create your InvoChat rooms to get started.
                    </p>
                  </Panel.Body>
                </Panel>

                <Panel className="step-4">
                  <Panel.Body>
                    <div className="number m-b-30">4</div>
                    <h4 className="m-b-20">Message securely</h4>
                    <p>
                      Directly name patients and share patient files to
                      collaborate more efficiently with compliance.
                    </p>
                  </Panel.Body>
                </Panel>
              </div>
            </div>
          </div>
        </VisibilitySensor>

        <Footer />

        <VideoModal
          state={this.state.modal}
          closeModal={this.closeModal}
          connectVideo
        />
      </div>
    );
  }
}

Connect.propTypes = {
  flipped: PropTypes.bool,
  header: PropTypes.string,
  subHeader: PropTypes.string
  // industryBodyText: PropTypes.string
};

Connect.defaultProps = {
  flipped: false,
  header: "InvoChat Messaging",
  subHeader:
    "Message your team, from any device. InvoChat is compliant and free to use with an unlimited number of people."
  // industryBodyText: "InvoChat"
};
