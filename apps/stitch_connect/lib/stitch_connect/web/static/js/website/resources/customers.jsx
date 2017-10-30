import React, { Component } from "react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";

// a16by9

export default class Customers extends Component {
  render() {
    return (
      <div>
        <div className="subheader customers-subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Customers</h1>
              <h3>
                See how customers have improved care coordination on our
                platform.
              </h3>
            </div>
          </div>
        </div>

        <div className="container">
          <Row>
            <Col sm={8} smOffset={2}>
              <div className="customer-box">
                <div className="page-header">
                  <h1>Luminance Recovery</h1>
                </div>

                <p className="m-b-30">
                  <a href="https://luminancerecovery.com/" target="_blank">
                    Luminance Recovery
                  </a>{" "}
                  offers a comfortable environment, trained professionals and
                  compassionate support staff to help people like you overcome
                  addiction. Our goal is simple: to empower every client to
                  understand their value, reconnect with the people they love
                  and — most importantly — free themselves from the burden of
                  substance addiction.
                </p>

                <p className="m-b-20">
                  <ResponsiveEmbed a16by9>
                    <embed src="https://www.youtube.com/embed/v1fjEFYMiyA?rel=0" />
                  </ResponsiveEmbed>
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
