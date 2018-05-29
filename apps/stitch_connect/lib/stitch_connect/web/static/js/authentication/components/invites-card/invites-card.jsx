import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import isEmpty from "lodash/isEmpty";

import { Card } from "common/components";
import LoadingButton from "../../../common/components/loading-button";

class InvitesCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      invites: ["", "", ""],
      validationResults: {},
      alertMessage: "",
      loading: false
    };
  }

  onKeyPress = e => {
    const hitEnter = e.charCode === 13 || e.keyCode === 13;

    if (hitEnter) {
      this.onNext(e);
    }
  };

  onNext = event => {
    event.preventDefault();

    const { invites } = this.state;
    this.setState({ loading: true });

    post("/api/v1/users/validate-emails", {
      body: { emails: this.state.invites },
      hideNotify: true
    })
      .then(response => {
        this.setState({ loading: false });
        const validationResults = {};
        response.data.forEach((e, index) => {
          const email = invites[index];
          if (e[email] !== true) {
            validationResults[email] = e[email] || "Unexpected Error";
          }
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
        this.setState({
          alertMessage: "Emails validation has failed.",
          loading: false
        });
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

  get errorText() {
    return "There was an issue with one or more of your emails. Please ensure they are valid.";
  }

  renderFooter() {
    return (
      <div className="invites-card-footer">
        <Button
          className="btn btn-lg btn-new btn-new-inverse m-b-40"
          onClick={this.onSkip}
        >
          Skip for now
        </Button>

        <LoadingButton
          type="submit"
          bsStyle="primary"
          className="btn btn-lg btn-new m-b-40"
          onClick={this.onNext}
          loading={this.state.loading}
        >
          <div className="next-button-interior">
            <div>Next</div>
            <div className="next-arrow-wrapper">
              <i className="fa fa-arrow-right" />
            </div>
          </div>
        </LoadingButton>
      </div>
    );
  }

  render() {
    const { invites, validationResults, alertMessage } = this.state;

    return (
      <div>
        <Card
          footer={this.renderFooter()}
          title="Send Invitations"
          errorText={alertMessage && this.errorText}
          description={
            <span>
              Your Stitch team is all set. Get started by bringing in your team
              members to explore Stitch with you.
            </span>
          }
        >
          <Form onSubmit={this.onNext}>
            <div className="invite-form-label-wrapper">
              <span>Email Address</span>
              <Button className="link" onClick={this.onAddEmail}>
                + Add Invitation
              </Button>
            </div>
            <div className="invite-form-input-wrapper">
              {invites.map((email, index) => {
                const validationState = validationResults[email]
                  ? "error"
                  : null;
                return (
                  <FormGroup
                    bsSize="large"
                    key={`invite_email_${index}`}
                    validationState={validationState}
                  >
                    <FormControl
                      autoFocus={index === 0}
                      type="text"
                      value={email}
                      onChange={this.onChange(index)}
                      placeholder="name@domain.com"
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
            </div>
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
