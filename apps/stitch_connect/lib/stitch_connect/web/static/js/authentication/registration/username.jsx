import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Username extends Component {
  constructor(props) {
    super();
    this.state = {
      username: ""
    };
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
    // post("/api/v1/users/create", {
    //   body: { username: this.state.username }
    // }).then(response => {
    //   console.log(response);
    //   console.log("Created");
    // });
    // to="/signup/password"
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/signup/phone-number">
                  <i className="fa fa-arrow-left" />
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Restart</Tooltip>}
              >
                <Link to="/signup/team-name">
                  <i className="fa fa-refresh" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>Username</h2>

        <h5>
          Enter a <strong>username</strong>.
        </h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="username"
              required
              autoFocus
              type="text"
              placeholder="username"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>

          <HelpBlock className="m-b-20">
            Your username is how other users will mention you in conversations.
            Pick something familiar.
          </HelpBlock>

          <input
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
