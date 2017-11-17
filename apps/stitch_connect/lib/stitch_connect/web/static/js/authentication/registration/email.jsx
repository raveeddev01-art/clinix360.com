import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import isEmail from "validator/lib/isEmail";

import { OnboardCard } from "common/components";

@inject("registrationStore")
@observer
class EmailCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: "",
      formValid: false
    };
  }

  onNext = () => {
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

  onChange = evt => {
    this.setState({
      email: evt.target.value,
      formValid: isEmail(evt.target.value)
    });
  };

  renderHeader() {
    return (
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
    );
  }

  render() {
    return (
      <OnboardCard
        title="Email"
        header={this.renderHeader()}
        description={
          <span>
            Enter your <strong>work email address</strong>.
          </span>
        }
        onNext={this.onNext}
        disableNext={!this.state.formValid}
      >
        <FormGroup bsSize="large">
          <FormControl
            name="email"
            required
            autoFocus
            type="email"
            placeholder="Email"
            value={this.state.email}
            onChange={this.onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          We will send you a confirmation code to verify your email. If your
          team already has an account, ask your admin for an invitation.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

export default EmailCard;
