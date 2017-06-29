import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class Login extends Component {
  constructor(props) {
    super();
    this.state = {
      email: "",
      password: ""
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
    // event.preventDefault();
    // post("/api/v1/users/create", {
    //   body: { email: this.state.email }
    // }).then(response => {
    //   console.log(response);
    //   console.log("Created");
    // });
    // to="/"
  };

  render() {
    return (
        <div className="authentication-card text-center">

          <div className="card-header">
            <Row>
              <Col xs={12} className="text-right">
                <OverlayTrigger placement="top" overlay={<Tooltip>Close</Tooltip>}>
                  <Link to="/">
                    <i className="fa fa-close"></i>
                  </Link>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>
          
          <h2>Sign In</h2>

          <h5>Enter your <strong>email address</strong> and <strong>password</strong>.</h5>

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

            <FormGroup bsSize="large">
              <FormControl 
                name="password"
                required
                autoFocus
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </FormGroup>

            <input
              value="Next"
              type="submit"
              className="btn btn-block btn-primary"
            />
            <Link to="/reset-password" className="btn btn-block btn-default">Reset Password</Link>
          </form>

          <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
        </div>
    );
  }
}