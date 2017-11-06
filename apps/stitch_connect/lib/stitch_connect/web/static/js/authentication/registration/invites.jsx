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
import Button from "react-bootstrap/lib/Button";

@inject("registrationStore")
@observer
export default class Invites extends Component {
  onNext = event => {
    const { registrationStore, history } = this.props;
    event.preventDefault();
    registrationStore.sendInvites = true;
    history.push("/signup/hipaa");
  };

  onSkip = event => {
    const { registrationStore, history } = this.props;
    event.preventDefault();
    registrationStore.sendInvites = false;
    history.push("/signup/hipaa");
  };

  onChange = index => evt => {
    const { registrationStore } = this.props;
    registrationStore.invites[index] = evt.target.value;
  };

  onAddEmail = () => {
    const { registrationStore } = this.props;
    registrationStore.invites.push("");
  };

  render() {
    const { registrationStore: { invites } } = this.props;

    return (
      <div className="authentication-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="back">Back</Tooltip>}
              >
                <Link to="/signup/pin">
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

        <h2>Send Invitations</h2>

        <h5>
          Enter <strong>invitations</strong> to email out.
        </h5>

        <form onSubmit={this.onNext}>
          {invites.map((email, index) => (
            <FormGroup bsSize="large" key={`invite_email_${index}`}>
              <FormControl
                type="text"
                value={email}
                onChange={this.onChange(index)}
              />
            </FormGroup>
          ))}

          <Button block className="m-b-10" onClick={this.onAddEmail}>
            Add Invitations
          </Button>

          <HelpBlock className="m-b-20">
            Enter your team members&#39; email addresses so they can join your
            team. You can also do this later after you set up your team.
          </HelpBlock>

          <Button block bsSize="lg" bsStyle="primary" type="submit">
            Next
          </Button>

          <Button
            block
            bsSize="lg"
            bsStyle="default"
            className="m-b-40"
            onClick={this.onSkip}
          >
            Skip this step
          </Button>
        </form>
      </div>
    );
  }
}
