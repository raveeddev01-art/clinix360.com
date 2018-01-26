import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import Alert from "react-bootstrap/lib/Alert";
import { Card } from "common/components";
import isEmpty from "lodash/isEmpty";

class InvitesCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      invites: ["", "", ""],
      validationResults: {},
      alertMessage: ""
    };
  }

  onNext = event => {
    event.preventDefault();

    const { invites } = this.state;
    post("/api/v1/users/validate-emails", {
      body: { emails: this.state.invites.join(",") },
      hideNotify: true
    })
      .then(response => {
        const validationResults = {};
        response.data.forEach((e, index) => {
          const email = invites[index];
          if (e[email] !== true) validationResults[email] = e[email];
        });
        if (isEmpty(validationResults)) {
          this.props.onNext({
            sendInvites: true,
            invites: this.state.invites
          });
        } else {
          this.setState({
            validationResults
          });
        }
      })
      .catch(() => {
        this.setState({ alertMessage: "Emails validation has failed." });
      });
  };

  onSkip = event => {
    event.preventDefault();
    this.props.onNext({
      sendInvites: false,
      invites: this.state.invites
    });
  };

  onChange = index => evt => {
    const invites = [...this.state.invites];
    invites[index] = evt.target.value;
    this.setState({
      invites
    });
  };

  onAddEmail = () => {
    this.setState({
      invites: [...this.state.invites, ""]
    });
  };

  render() {
    const { invites, validationResults, alertMessage } = this.state;

    return (
      <div>
        {alertMessage && <Alert bsStyle="danger">{alertMessage}</Alert>}
        <Card
          title="Send Invitations"
          description={
            <span>
              Enter <strong>invitations</strong> to email out.
            </span>
          }
        >
          <Form onSubmit={this.onNext}>
            {invites.map((email, index) => {
              const validationState = validationResults[email] ? "error" : null;
              return (
                <FormGroup
                  bsSize="large"
                  key={`invite_email_${index}`}
                  validationState={validationState}
                >
                  <FormControl
                    type="text"
                    value={email}
                    onChange={this.onChange(index)}
                    placeholder="name@example.com"
                  />
                  {validationState === "error" && (
                    <HelpBlock className="text-left">
                      <i className="fa fa-exclamation-circle" />{" "}
                      {validationResults[email]}
                    </HelpBlock>
                  )}
                </FormGroup>
              );
            })}

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
          </Form>
        </Card>
      </div>
    );
  }
}

InvitesCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

InvitesCard.defaultProps = {
  onNext: () => {}
};

export default InvitesCard;
