import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import ProgressiveImage from "react-progressive-image";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";

import Header from "./components/header";
import CreateTeam from "./components/create-team";
import OurCustomers from "./components/our-customers";
import GetStarted from "./components/get-started";
import Footer from "./components/footer";
import VideoModal from "./components/video-modal";

export default class Homepage extends Component {
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
    return (
      <div className="homepage">
        <Header />

        <div className="subheader">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <h1>The Workspace for Healthcare Teams</h1>

                <h3 className="m-b-30">
                  Stitch is an app for healthcare teams to send internal
                  messages, communicate with patients and track daily tasks —
                  fully HIPAA compliant and free to use.
                </h3>

                <CreateTeam />

                <a
                  className="play-video-link hidden-xs hidden-sm"
                  onClick={this.videoModal}
                >
                  <span className="play-btn">
                    <i className="fa fa-play" />
                  </span>
                  <span>Watch The Video</span>
                </a>
              </div>

              <div className="flex-item">
                <img
                  src="/images/homepage-header.png"
                  alt="Stitch Platform"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="stitch-products">
          <div className="container">
            <h2>Three powerful tools in a single workspace</h2>
            <h3>
              Combined with your EHR, it’s everything you need to run your
              practice.
            </h3>

            <hr className="section-line" />

            <div className="flex-box">
              <div className="flex-item">
                <Link
                  className="panel panel-default connect-card"
                  to="/connect"
                >
                  <div className="panel-body">
                    <div className="hover-line" />
                    <h5 className="meta text-uppercase">Team Messaging</h5>
                    <h3 className="title">
                      <i className="fa fa-comments" /> Connect
                    </h3>
                    <p className="m-b-20">
                      Keep everyone in sync with real-time messaging designed
                      for healthcare teams.
                    </p>

                    <div className="learn-more">
                      Learn more <i className="fa fa-arrow-right" />
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex-item">
                <Link className="panel panel-default engage-card" to="/engage">
                  <div className="panel-body">
                    <div className="hover-line" />
                    <h5 className="meta text-uppercase">Patient Messaging</h5>
                    <h3 className="title">
                      <i className="fa fa-bullhorn" /> Engage
                    </h3>
                    <p className="m-b-20">
                      Send messages, share files, collect forms and start video
                      calls directly with patients.
                    </p>

                    <div className="learn-more">
                      Learn more <i className="fa fa-arrow-right" />
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex-item">
                <LinkContainer to="/manage">
                  <Link
                    className="panel panel-default manage-card"
                    to="/manage"
                  >
                    <div className="panel-body">
                      <div className="hover-line" />
                      <h5 className="meta text-uppercase">Task Management</h5>
                      <h3 className="title">
                        <i className="fa fa-tasks" /> Manage
                      </h3>
                      <p className="m-b-20">
                        Assign and manage tasks to keep your team’s workflow
                        organized and on track.
                      </p>

                      <div className="learn-more">
                        Learn more <i className="fa fa-arrow-right" />
                      </div>
                    </div>
                  </Link>
                </LinkContainer>
              </div>
            </div>
          </div>
        </div>

        <OurCustomers />

        <GetStarted />

        <Footer />

        <VideoModal state={this.state.modal} closeModal={this.closeModal} />
      </div>
    );
  }
}
