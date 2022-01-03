import React, { Component } from "react";

import Header from "./components/header";
import CreateTeam from "./components/create-team";
import OurCustomers from "./components/our-customers";
import ProductCards from "./components/product-cards";
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
                <h1>Deliver a great patient experience</h1>

                <h3 className="m-b-30">
                InvoChat is an app for InvoChat teams to send internal
                  messages, communicate with patients and track daily tasks —
                  fully HIPAA compliant and free to use.
                </h3>

                <CreateTeam />

                <a
                  className="play-video-link hidden-xs hidden-sm"
                  onClick={this.videoModal}
                >
                  <span className="play-btn">
                    <i className="far fa-play" />
                  </span>
                  <span>Watch the video</span>
                </a>
              </div>

              <div className="flex-item">
                <img
                  src="/images/homepage-header.png"
                  alt="InvoChat Platform"
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

            <ProductCards />
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
