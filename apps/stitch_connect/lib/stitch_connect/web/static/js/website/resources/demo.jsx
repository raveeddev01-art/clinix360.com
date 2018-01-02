import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { animateScroll as scroll } from "react-scroll";

import Header from "../components/header";
import OurCustomers from "../components/our-customers";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class Demo extends Component {
  constructor(props) {
    super(props);
    this.scrollToTop = this.scrollToTop.bind(this);

    this.state = {
      fullName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      formSubmitted: false
    };
  }

  scrollToTop() {
    scroll.scrollToTop();
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { fullName, email, phoneNumber, companyName } = this.state;

    post("/api/v1/request-demo", {
      body: { fullName, email, phoneNumber, companyName }
    }).then(response => {
      this.setState({ formSubmitted: true });
      scroll.scrollToTop();
    });
  };

  demoRequest() {
    return !this.state.formSubmitted ? (
      <div className="flex-box">
        <div className="flex-item text-center">
          <h1>Request a Demo</h1>
          <h3 className="m-b-40">
            Enable your team to seamlessly work together.{" "}
            <br className="hidden-xs" />Learn how Stitch works today.
          </h3>
          <img
            src="/images/homepage-platform.png"
            alt="Stitch Platform"
            className="img-responsive hidden-xs hidden-sm"
          />
        </div>

        <div className="flex-item">
          <Panel className="demo-form m-b-0">
            <h4 className="text-center m-b-20">
              Tell us a little about yourself, and we’ll be in touch right away.
            </h4>

            <form onSubmit={this.handleSubmit}>
              <FormGroup bsSize="large">
                <ControlLabel>
                  Full Name <span>*</span>
                </ControlLabel>
                <FormControl
                  name="fullName"
                  required
                  autoFocus
                  placeholder="Full Name"
                  type="text"
                  value={this.state.fullName}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <FormGroup bsSize="large">
                <ControlLabel>
                  Email Address <span>*</span>
                </ControlLabel>
                <FormControl
                  name="email"
                  required
                  placeholder="hello@stitch.health"
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <FormGroup bsSize="large">
                <ControlLabel>
                  Phone Number <span>*</span>
                </ControlLabel>
                <FormControl
                  name="phoneNumber"
                  required
                  placeholder="555-555-5555"
                  type="text"
                  value={this.state.phoneNumber}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <FormGroup bsSize="large" className="m-b-30">
                <ControlLabel>
                  Company Name <span>*</span>
                </ControlLabel>
                <FormControl
                  name="companyName"
                  required
                  placeholder="Stitch Health"
                  type="text"
                  value={this.state.companyName}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <Button type="submit" bsStyle="primary" block>
                Request a Demo
              </Button>
            </form>
          </Panel>
        </div>
      </div>
    ) : (
      <div className="text-center">
        <h1>Demo Request Confirmed!</h1>
        <h3 className="m-b-40">
          We received your request and will reach out momentarily.{" "}
          <br className="hidden-xs" />
          In the meantime, see how our customers are improving patient care on
          Stitch.
        </h3>

        <LinkContainer to="/customers">
          <Button>View Stories</Button>
        </LinkContainer>
      </div>
    );
  }

  render() {
    return (
      <div className="demo-page">
        <Header />

        <div className="subheader ">
          <div className="container">{this.demoRequest()}</div>
        </div>

        <OurCustomers />

        <Footer />
      </div>
    );
  }
}
