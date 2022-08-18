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
                <h2>{header}</h2>

                <h3 className="m-b-30">{subHeader}</h3>

                <Button bsStyle="primary" href="mailto:info@invozone.com?subject=InvoChat: Request Information">Request Demo</Button>

                <a className="trial-link" href="/getstarted/">
                  <i className="fa fa-external-link"></i>
                  Sign up for a free 14 days trail
                </a>
              </div>

              <div className="flex-item">
                <img
                  src="/images/connect-header.png"
                  alt="InvoChat Platform"
                  className="img-responsive"
                />
              </div>
            </div>
            <div>
              <h4>Already using InvoChat?              
                <a className="signin-link" href="/signin">
                  Sign in
                </a>
              </h4>
            </div>
          </div>
        </div>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Simplify problem-solving & decision-making with topic-specific chat rooms"
          image="/images/connect-feature-1.png"
        >
          Bring down email clutter and messy chats with dedicated
          chat rooms and threads around projects, topics, and teams. 
          Public and private chat rooms bring teams together for a 
          powerful dialogue or just spitballing creative ideas. 
          You can easily:
          <ul>
            <li>Discuss what’s important</li>
            <li>Check task progress and updates</li>
            <li>Notify specific members relevant to a given discussion through tags</li>
            <li>Connect with your team via google meet integration on the go.</li>
          </ul>
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Make company-wide communication trouble-free through instant file sharing"
          image="/images/connect-feature-2.png"
        >
          Easily upload files of any type into InvoChat —  
          JPEG, PNG, PDF, MP3, Word, Excel, PowerPoint, and more. 
          Make them instantly available to your team members, and 
          drop the headache of tedious email attachments. 
          <ul>
            <li>Upload and share files with your whole team or specific people</li>
            <li>All the documents are safely stored on InvoChat</li>
            <li>Search functionality allows you to find files within seconds</li>
            <li>Pin or mark documents as favorites for later viewing</li>
          </ul>
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Personalized notifications that matter to you with custom options to stay focused"
          image="/images/connect-feature-3.png"
        >
          With InvoChat, you can apply the custom notification 
          preferences to every conversation, so you can stay
          focused and in the loop.
          <ul>
            <li>Manage your chat notifications across all browsers, OS, and apps (iOS and Android )</li>
            <li>Turn chat room notifications on and off as needed</li>
            <li>Prioritize only notifications that are relevant to you</li>
            <li>Automatically get notifications when you create, respond, or are mentioned in a message</li>
          </ul>
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Enable instant and direct communication through 1:1 chat with your team members"
          image="/images/connect-feature-4.png"
        >
          Quicker and more efficient communication leads to higher productivity. 
          Instant messaging allows you to better communicate with your entire team 
          in real-time without any delays. No more texting, email, or phone calls.
          <ul>
            <li>Securely share files, documents, and high-resolution images/videos</li>
            <li>Read receipts for when someone has read or received your message</li>
            <li>Mute notifications during important meetings</li>
            <li>Mark your top conversations as favorites and pin important messages</li>
          </ul>
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Create collaborative workspaces to stay on top of things"
          image="/images/connect-feature-3.png"
        >
          InvoChat workspaces offer a single most centralized 
          platform for companies and it’s employees who require
          constant collaboration and communication with clients 
          and each other on projects and tasks.​​

          <ul>
            <li>Manage and track multiple projects asynchronously</li>
            <li>Tools for better support, safe file storage, and swift data availability</li>
            <li>Exchange or spitball ideas through topic-based chat rooms</li>
            <li>Enable hybrid working, and reduce geographical barriers</li>
          </ul>
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
                    <i className="far fa-video-camera" /> Google Meet Integrations
                  </h4>
                  <p className="m-b-15">
                    Effortlessly start google meet calls in any chat room with a single click 
                    without having to create and share meet links.
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
                      InvoChat is secured with end-to-end encryption. 
                      Securely chat and share files for efficient collaboration.
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
  header: "Effortless online collaboration tool for in-house and remote teams",
  subHeader:
    "Catch up on important conversations and say hi to quick and productive collaboration on tasks & projects through secure chat with your teammates, file attachments, video calls, and more - all through a single platform."
  // industryBodyText: "InvoChat"
};
