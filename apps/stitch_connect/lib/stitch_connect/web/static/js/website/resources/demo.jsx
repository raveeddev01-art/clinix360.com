import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";

export default class Demo extends Component {
  render() {
    return (
      <div className="demo-page">
        <Header />

        <div className="subheader ">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <ResponsiveEmbed a16by9>
                  <embed src="https://www.youtube.com/embed/v1fjEFYMiyA?rel=0" />
                </ResponsiveEmbed>
              </div>

              <Panel className="demo-form">
                <h3 className="text-center">Schedule a Demo</h3>

                <h4 className="text-center m-b-20">
                  Tell us a little about yourself, and we’ll be in touch right
                  away.
                </h4>

                <form>
                  <FormGroup bsSize="large">
                    <ControlLabel>Full Name</ControlLabel>
                    <FormControl required autoFocus placeholder="Full Name" />
                  </FormGroup>

                  <FormGroup bsSize="large">
                    <ControlLabel>Email Address</ControlLabel>
                    <FormControl
                      required
                      placeholder="hello@stitchhealth.com"
                    />
                  </FormGroup>

                  <FormGroup bsSize="large">
                    <ControlLabel>Phone Number</ControlLabel>
                    <FormControl required placeholder="Phone Number" />
                  </FormGroup>

                  <FormGroup bsSize="large" className="m-b-30">
                    <ControlLabel>Company Name</ControlLabel>
                    <FormControl required placeholder="Company Inc" />
                  </FormGroup>

                  <Button bsSize="lg" bsStyle="primary" block>
                    Submit
                  </Button>
                </form>
              </Panel>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}
