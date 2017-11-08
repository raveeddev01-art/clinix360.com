import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer, inject } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@inject("registrationStore")
@observer
export default class Email extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      formValid: false
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      formValid: value.length > 0 && /.+@.+\..+/.test(value)
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    post("/api/v1/users", {
      body: { email: this.state.email }
    }).then(response => {
      this.props.registrationStore.userId = response.data.id;
      this.props.registrationStore.email = this.state.email;
      post("/api/v1/users/send-confirmation-code", {
        body: { id: response.data.id }
      }).then(() => {
        this.props.history.push("/signup/confirmation-code");
      });
    });
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={12} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="close">Close</Tooltip>}
              >
                <Link to="/getstarted">
                  <i className="fa fa-close" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>Email</h2>

        <h5>
          Enter your <strong>work email address</strong>.
        </h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="email"
              required
              autoFocus
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>

          <HelpBlock className="m-b-20">
            We will send you a confirmation code to verify your email. If your
            team already has an account, ask your admin for an invitation.
          </HelpBlock>

          <input
            disabled={!this.state.formValid}
            value="Next"
            type="submit"
            className="btn btn-block btn-lg btn-primary m-b-40"
          />
        </form>
      </div>
    );
  }
}
