import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import Card from "../components/card/card";

export default class FindTeam extends Component {
  constructor(props) {
    super();
    this.state = {
      email: ""
    };
  }

  _onChange = event => {
    this.setState({ email: event.target.value });
  };

  _onSubmit = event => {
    event.preventDefault();
    window.location = `https://${this.state.team_name}.${applicationHost}`;
  };

  _renderHeader = () => {
    const { backUrl, restartUrl } = this.props;
    return (
      <div className="card-header">
        <Row>
          <Col xs={6} className="text-left">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="back">Back</Tooltip>}
            >
              <Link to="/signin">
                <i className="fa fa-arrow-left" />
              </Link>
            </OverlayTrigger>
          </Col>

          <Col xs={6} className="text-right">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="restart">Close</Tooltip>}
            >
              <Link to="/">
                <i className="fa fa-close" />
              </Link>
            </OverlayTrigger>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const { email } = this.state;
    return (
      <Card
        title="Find Your Team"
        description={
          <span>
            Enter your email address and we'll send you links to your existing
            teams.
          </span>
        }
        header={this._renderHeader()}
      >
        <Form onSubmit={this._onSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              type="email"
              placeholder="Email"
              value={email}
              onChange={this._onChange}
            />
          </FormGroup>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
          >
            Submit
          </Button>
        </Form>
      </Card>
    );
  }
}
