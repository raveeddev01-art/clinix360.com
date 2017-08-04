import React, { Component, PropTypes } from "react";
import { inject, observer } from "mobx-react";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { Link } from "react-router-dom";

import Card from "../components/card/card.jsx";

@inject("resetPasswordStore")
@observer
class SendEmail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: ""
    };
  }

  _onChange = evt => this.setState({ email: evt.target.value });
  _onSubmit = evt => {
    evt.preventDefault();
    this.props.resetPasswordStore.sendEmail(this.state.email);
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
              <Link to="/login">
                <i className="fa fa-arrow-left" />
              </Link>
            </OverlayTrigger>
          </Col>

          <Col xs={6} className="text-right">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="restart">Close</Tooltip>}
            >
              <Link to="/login">
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
        title="Password Reset"
        description={
          <span>
            Enter your <strong>email address</strong>.
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
            Reset Password
          </Button>
        </Form>
      </Card>
    );
  }
}

export default SendEmail;
