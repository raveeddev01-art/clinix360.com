import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class FirstName extends Component {
  constructor(props) {
    super();
    this.state = {
      first_name: ""
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
    //   body: { first_name: this.state.first_name }
    // }).then(response => {
    //   console.log(response);
    //   console.log("Created");
    // });
    // to="/signup/confirmation-code"
  };

  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/signup/team-name">
                  <i className="fa fa-arrow-left"></i>
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger placement="top" overlay={<Tooltip>Restart</Tooltip>}>
                <Link to="/signup/team-name">
                  <i className="fa fa-refresh"></i>
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>
        
        <h2>First Name</h2>

        <h5>Enter your <strong>first name</strong>.</h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl 
              name="first_name"
              required
              autoFocus
              type="text"
              placeholder="First Name"
              value={this.state.first_name}
              onChange={this.handleChange}
            />
          </FormGroup>
          
          <HelpBlock>Your name will be shown next to your profile and messages.</HelpBlock>

          <input
            value="Next"
            type="submit"
            className="btn btn-block btn-primary"
          />
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}