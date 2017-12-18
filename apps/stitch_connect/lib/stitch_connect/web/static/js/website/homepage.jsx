import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import cx from "classnames";

import Header from "./components/header";
import CUSTOMERS from "./components/customers-logos";
import GetStarted from "./components/get-started";
import Footer from "./components/footer";

import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";
import Carousel from "react-bootstrap/lib/Carousel";

export default class Homepage extends Component {
  renderCustomers() {
    return CUSTOMERS.map((c, index) => {
      const className = cx("col-lg-5ths col-md-3 col-xs-4", {
        "visible-lg": index % 5 === 4
      });
      return (
        <div className={className} key={`customer_${index}`}>
          <img src={c.img} alt={c.title} />
        </div>
      );
    });
  }

  render() {
    return (
      <div className="homepage">
        <Header />

        <div className="subheader text-center">
          <div className="container">
            <h1>Care Coordination</h1>
            <h3 className="m-b-30">
              Communicate, write notes, track tasks and upload files on any
              device.
            </h3>

            <div className="m-b-30">
              <LinkContainer to="/demo">
                <Button bsSize="lg">Request Demo</Button>
              </LinkContainer>

              <Button
                bsSize="lg"
                bsStyle="primary"
                href={`https://${applicationHost}/signup/email`}
              >
                Start Trial
              </Button>
            </div>

            <div className="mbp">
              <img
                src="/images/homepage-platform.png"
                alt="Stitch Platform"
                className="img-responsive"
              />
            </div>
          </div>
        </div>

        <div className="our-customers text-center">
          <div className="container">
            <h4 className="text-uppercase">Trusted by top healthcare teams</h4>
            <div className="customer-logos">
              <div className="row logo-row">{this.renderCustomers()}</div>
            </div>
          </div>
        </div>

        <div className="features-holder">
          <div className="feature">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="info">
                    <h2>
                      <img src="/images/connect-icon.png" alt="Connect" />{" "}
                      Connect
                    </h2>
                    <h3>Team Communication</h3>

                    <p className="m-b-20">
                      Stitch Connect provides a powerful team communication
                      experience across all devices. We complement a modern user
                      experience with advanced security architecture to deliver
                      the latest in communication technology to the healthcare
                      world.
                    </p>

                    <LinkContainer to="/connect">
                      <Button
                        bsStyle="primary"
                        bsSize="large"
                        className="m-b-40"
                      >
                        Learn More
                      </Button>
                    </LinkContainer>
                  </div>
                </div>

                <div className="flex-item">
                  <img
                    src="/images/connect-homepage-test.png"
                    alt="Stitch Connect"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="feature alt">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <img
                    src="/images/engage-homepage.png"
                    alt="Stitch Engage"
                    className="img-responsive"
                  />
                </div>

                <div className="flex-item">
                  <div className="info">
                    <h2>
                      <img src="/images/engage-icon.png" alt="Connect" /> Engage
                    </h2>
                    <h3>Patient Engagement</h3>

                    <p className="m-b-20">
                      Stitch Engage offers a complete patient engagement
                      solution. Send messages, share files and start video calls
                      directly with patients. Relax knowing your patients can
                      easily access important communications with our
                      intuitively designed app on any device.
                    </p>

                    <LinkContainer to="/engage">
                      <Button
                        bsStyle="primary"
                        bsSize="large"
                        className="m-b-40"
                      >
                        Learn More
                      </Button>
                    </LinkContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="info">
                    <h2>
                      <img src="/images/manage-icon.png" alt="Manage" /> Manage
                    </h2>
                    <h3>Patient Management</h3>

                    <p className="m-b-20">
                      Stitch Manage is the easiest way to collaborate on
                      patients. Post clinical notes, status updates and key data
                      points to keep everyone on the same page. Use Manage to
                      track patient tasks and keep your workflow organized,
                      wherever you are.
                    </p>

                    <LinkContainer to="/manage">
                      <Button
                        bsStyle="primary"
                        bsSize="large"
                        className="m-b-40"
                      >
                        Learn More
                      </Button>
                    </LinkContainer>
                  </div>
                </div>

                <div className="flex-item">
                  <img
                    src="/images/manage-homepage.png"
                    alt="Stitch Manage"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="customers text-center">
          <div className="container">
            <h3 className="m-b-30">Here's what our customers are saying</h3>

            <div className="vid">
              <ResponsiveEmbed a16by9>
                <embed src="https://www.youtube.com/embed/v1fjEFYMiyA?rel=0" />
              </ResponsiveEmbed>
            </div>

            <Carousel
              interval={null}
              prevIcon={<i className="fa fa-angle-left" />}
              nextIcon={<i className="fa fa-angle-right" />}
            >
              <Carousel.Item>
                <h4 className="quote">
                  "I couldn’t imagine running my operations without Stitch. It
                  really does save lives, it improves the client experience, and
                  I think every treatment center should be using the tool."
                </h4>

                <img
                  src="/images/customer-luminance.png"
                  alt="Luminance"
                  className="m-b-10"
                />

                <div className="person">
                  <strong>Michael Krause</strong>
                  <div>Chief Revenue Officer at Luminance Recovery</div>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <h4 className="quote">
                  "Being able to provide real-time responses leads to a huge
                  increase in the quality of patient care."
                </h4>

                <img
                  src="/images/customer-pbsc.png"
                  alt="PBSC"
                  className="m-b-10"
                />

                <div className="person">
                  <strong>Lyndsey Caliendo</strong>
                  <div>Director of Operations at Princeton Brain & Spine</div>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <h4 className="quote">
                  "The interface on Stitch is very intuitive. It wasn’t
                  something that we had to dedicate any training to because
                  people already knew how to use it out of the box."
                </h4>

                <img
                  src="/images/customer-dssi.png"
                  alt="DSSI"
                  className="m-b-10"
                />

                <div className="person">
                  <strong>Brent Spencer</strong>
                  <div>Owner at Dermatology & Skin Surgery Institute</div>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <h4 className="quote">
                  "I can get all the information I need immediately, right in
                  Stitch."
                </h4>

                <img
                  src="/images/customer-citywide.png"
                  alt="Citywide"
                  className="m-b-10"
                />

                <div className="person">
                  <strong>Tara Collins</strong>
                  <div>Assistant Professor at UCSF School of Medicine</div>
                </div>
              </Carousel.Item>
            </Carousel>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
