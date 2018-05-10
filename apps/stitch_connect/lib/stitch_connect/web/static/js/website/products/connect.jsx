import React, { Component } from "react";
import PropTypes from "prop-types";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import CreateTeam from "../components/create-team";
import OurCustomers from "../components/our-customers";
import Feature from "../components/feature";
import Footer from "../components/footer";
import GetStarted from "../components/get-started";
import Header from "../components/header";
import VideoModal from "../components/video-modal";

export default class Connect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: ""
    };
  }

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

    return (
      <div className="product-page">
        <Header />
        <div className="subheader">
          <div className="container">
            <Row>
              <Col md={6} xsHidden smHidden>
                <div className="header-video">
                  <img
                    src="/images/homepage-platform.png"
                    alt="Stitch Platform"
                    className="img-responsive"
                  />
                  <div
                    className="play-video text-center"
                    onClick={this.videoModal}
                  >
                    <i className="fa fa-play" />
                  </div>
                </div>
              </Col>

              <Col sm={12} md={6}>
                <h1>
                  The messaging app for <br className="visible-lg" />healthcare
                  teams
                </h1>
                <h3 className="m-b-30">
                  Free to use with unlimited number of people.
                </h3>

                <CreateTeam />

                <a
                  className="mobile-video hidden-md hidden-lg"
                  onClick={this.videoModal}
                >
                  <i className="fa fa-play m-r-5" /> See How It Works
                </a>
              </Col>
            </Row>
          </div>
        </div>

        <OurCustomers />

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Get to the right person at the right time."
          image="/images/connect-feature-1-new.png"
        >
          <span className="m-b-20">
            Stitch Connect lets you organize conversations the way your team
            works, so you always know where to communicate.
          </span>
          <span>
            Public and private rooms bring healthcare teams together for
            powerful team dialogue. Easily discuss patients, events, tasks and
            more. Direct messages enable instant 1-to-1 communication. No more
            pagers, email, fax machines or phone calls.
          </span>
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Easily share information across the team"
          image="/images/connect-feature-2-new.png"
        >
          <span className="m-b-20">
            Healthcare workflows are filled with files: patient charts, labs,
            images, intake forms and more. Stitch solves the problems of sharing
            siloed healthcare data both inside and outside your team.{" "}
          </span>
          <span>
            Easily upload files of any type into Stitch — JPEG, PNG, PDF, MP3,
            Word, Excel, PowerPoint, and more. You can preview them right in the
            app, without the headache of downloading files to your device.
          </span>
        </Feature>

        <Feature
          featureClassName={flipped ? "alt" : ""}
          heading="Choose notifications that matter to you"
          image="/images/connect-feature-3-new.png"
        >
          <span className="m-b-20">
            From the front desk to the clinical room, communication never stops.
            In today’s modern practice, it’s hard to stay focused and keep track
            of so many communication streams.{" "}
          </span>
          <span>
            With Stitch, you can apply custom notification preferences to every
            conversation. Say goobye to cluttered inboxes, noisy pagers and
            unruly text threads. Best of all, Stitch goes wherever you go with
            native Mac, Windows, iOS and Android apps.
          </span>
        </Feature>

        <Feature
          featureClassName={flipped ? "" : "alt"}
          heading="Instantly find answers when you need them"
          image="/images/connect-feature-4-new.png"
        >
          <span className="m-b-20">
            Your communications are your most valuable asset. Yet, thousands of
            team decisions, discoveries and pieces of useful information are
            lost in SMS, email, hallway chats and phone calls.
          </span>
          <span>
            Stitch turns historical conversations into the ultimate source of
            answers: it’s built from the ground up for deep search. Every
            message, every file, every comment is carefully archived and made
            searchable. Team knowledge at your fingertips, whenever you need it.
          </span>
        </Feature>

        <div className="additional-features text-center">
          <div className="container">
            <h3 className="m-b-50">
              Everything you need to keep your team in sync
            </h3>

            <Row>
              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-bar-chart" /> Analytics
                  </h4>
                  <p className="m-b-15">
                    View engagement statistics to understand the how, when and
                    who of your team’s Stitch usage. Visualize robust graphs of
                    messages sent and files shared for deep insight.
                  </p>

                  <a href="#">Learn more about Analytics</a>
                </div>
              </Col>

              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-cogs" /> Security
                  </h4>
                  <p className="m-b-15">
                    Control all the details. Stitch lets you fine-tune security
                    features like our inactivity lockout interval, password
                    complexity requirements and new user invite ability.
                  </p>

                  <a href="#">Learn more about Security</a>
                </div>
              </Col>

              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-bell" /> Custom Alerts
                  </h4>
                  <p className="m-b-15">
                    Help your team stay on top of conversations with our
                    group-level alert settings. Every chat room has custom
                    notification settings, so you never miss a beat.
                  </p>

                  <a href="#">Learn more about Notifications</a>
                </div>
              </Col>

              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-check-circle" /> Read Receipts
                  </h4>
                  <p className="m-b-15">
                    No more guessing if your message has been read. Improve team
                    accountability and reliability with easy-to-access read
                    receipts for every message.
                  </p>

                  <a href="#">Learn more about Read Receipts</a>
                </div>
              </Col>

              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-users" /> Administration
                  </h4>
                  <p className="m-b-15">
                    Visualize your team and adjust user rights easily.
                    Deactivate stale members with the click of a button. Need
                    user access logs or data exports? We’ve got you covered.
                  </p>

                  <a href="#">Learn more about Administration</a>
                </div>
              </Col>

              <Col sm={4}>
                <div className="feature-block">
                  <h4 className="m-b-20">
                    <i className="fa fa-video-camera" /> Video Calls
                  </h4>
                  <p className="m-b-15">
                    Work efficiently with in-app voice and video calls. When
                    your team needs more than text to get the message across,
                    video calls are the perfect way to accelerate collaboration.
                  </p>

                  <a href="#">Learn more about Video Calls</a>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <GetStarted />
        <Footer />

        <VideoModal state={this.state.modal} closeModal={this.closeModal} />
      </div>
    );
  }
}

Connect.propTypes = {
  flipped: PropTypes.bool,
  header: PropTypes.string,
  industryBodyText: PropTypes.string,
  subHeader: PropTypes.string
};

Connect.defaultProps = {
  flipped: false,
  header: "Connect",
  industryBodyText: "healthcare",
  subHeader: "Team Communication"
};
