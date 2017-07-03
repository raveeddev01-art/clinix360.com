import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@observer
export default class FullName extends Component {
  constructor(props) {
    super();
    this.state = {
      firstName: "",
      lastName: ""
    };
  }

  formValid = () => {
    return this.state.firstName.length > 0 && this.state.lastName.length > 0;
  };

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
    store.instance.fullname = `${this.state.firstName} ${this.state.lastName}`;
    this.props.history.push("/signup/username");
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="back">Back</Tooltip>}
              >
                <Link to="/signup/team-name">
                  <i className="fa fa-arrow-left" />
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="restart">Restart</Tooltip>}
              >
                <Link to="/signup/team-name">
                  <i className="fa fa-refresh" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>Name</h2>

        <h5>
          Enter your <strong>full name</strong>.
        </h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="firstName"
              required
              autoFocus
              type="text"
              placeholder="First name"
              value={this.state.firstName}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup bsSize="large">
            <FormControl
              name="lastName"
              required
              type="text"
              placeholder="Last name"
              value={this.state.lastName}
              onChange={this.handleChange}
            />
          </FormGroup>

          <HelpBlock className="m-b-20">
            Your name will be shown next to your profile and messages.
          </HelpBlock>

          <input
            disabled={!this.formValid()}
            value="Next"
            type="submit"
            className="btn btn-block btn-lg btn-primary m-b-40"
          />
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
