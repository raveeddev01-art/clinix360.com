import React, { Component } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import Header from "../components/header";
import CUSTOMERS from "../components/customers-logos";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class Demo extends Component {
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
      <div className="demo-page">
        <Header />

        <div className="subheader ">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item text-center">
                <h1>Request a Demo</h1>
                <h3 className="m-b-40">
                  Enable your team to seamlessly work together. <br />Learn how
                  Stitch works today.
                </h3>
                <img
                  src="/images/homepage-mbp.png"
                  alt=""
                  className="img-responsive"
                />
              </div>

              <div className="flex-item">
                <Panel className="demo-form">
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
                      Request a demo
                    </Button>
                  </form>
                </Panel>
              </div>
            </div>
          </div>
        </div>

        <div className="our-customers text-center">
          <div className="container">
            <h3 className="text-uppercase">Trusted by top healthcare teams</h3>
            <div className="customer-logos">
              <div className="row logo-row">{this.renderCustomers()}</div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}
