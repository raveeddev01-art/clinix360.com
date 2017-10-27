import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import cx from "classnames";

import CUSTOMERS from "./components/customers";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Landing extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: ""
    };
  }

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

  onChange = evt => {
    this.setState({ email: evt.target.value });
  };

  onSubmit = evt => {
    evt.preventDefault();
    post("/api/v1/users", {
      body: { email: this.state.email }
    }).then(resp => {
      return post("/api/v1/users/send-confirmation-code", {
        body: { id: resp.data.id }
      }).then(() => {
        window.location.href = `/signup/confirmation-code?userId=${resp.data
          .id}`;
      });
    });
  };

  render() {
    const { email } = this.state;

    return (
      <div>
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Care Coordination</h1>
              <h3>
                Communicate, write notes, track tasks, <br />upload files, and
                collaborate on any device.
              </h3>

              <Form className="flex-form" onSubmit={this.onSubmit}>
                <div className="form-input">
                  <FormControl
                    required
                    id="createTeam"
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={this.onChange}
                  />
                </div>

                <Button type="submit">Create Team</Button>
              </Form>

              <div className="trial">
                Get started with an unlimited{" "}
                <br className="visible-xs-inline" />number of people on our free
                14-day trial.
              </div>
            </div>
          </div>
        </div>

        <div className="our-customers text-center">
          <div className="container">
            <div className="customer-logos">
              <div className="row logo-row">{this.renderCustomers()}</div>
            </div>
          </div>
        </div>

        <section className="stitch-products">
          <div className="product-section">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="product-info">
                    <h2>Connect</h2>
                    <h3>Team Messaging</h3>

                    <p className="m-b-20">
                      Stitch Connect provides a powerful team communication
                      experience across all devices. We complement a modern user
                      experience with advanced security architecture to deliver
                      the latest in communication technology to the healthcare
                      world.
                    </p>

                    <LinkContainer to="/pricing">
                      <Button bsStyle="primary" bsSize="large">
                        Learn More
                      </Button>
                    </LinkContainer>
                  </div>
                </div>

                <div className="flex-item">
                  <div className="product-image">
                    <img
                      src="/images/connect-apps.png"
                      alt="Stitch Connect"
                      className="img-responsive"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-section">
            <div className="container">
              <h3>Engage</h3>
            </div>
          </div>

          <div className="product-section">
            <div className="container">
              <h3>Manage</h3>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
