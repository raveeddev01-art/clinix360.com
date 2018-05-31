import React, { Component } from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import { AuthenticationPage, LoadingButton } from "common/components";

const emailErrorText =
  "There was an issue with one or more of your emails. Please ensure they are valid.";

class InvitesCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      invites: ["", "", ""],
      validationResults: {},
      showError: false,
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
            loading: false,
            validationResults
          });
        }
      })
      .catch(() => {
        this.setState({
          showError: true,
          loading: false
        });
      });
  };

  onSkip = event => {
    event.preventDefault();

    this.setState({
      loading: true
    });

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

  renderFooter() {
    return (
      <div className="invites-card-footer m-b-40">
        <Button
          className="btn btn-lg btn-onboarding btn-onboarding-inverse m-b-10"
          onClick={this.onSkip}
        >
          Skip for now
        </Button>

        <LoadingButton
          type="submit"
          bsStyle="primary"
          className="btn btn-lg btn-onboarding m-b-10"
          onClick={this.onNext}
          loading={this.state.loading}
        >
          <div className="next-button-interior">
            <div>Send Invites </div>
            <div className="next-arrow-wrapper">
              <i className="fa fa-arrow-right" />
            </div>
          </div>
        </LoadingButton>
      </div>
    );
  }

  render() {
    const { invites, validationResults, showError } = this.state;

    return (
      <div>
        <AuthenticationPage
          title="Send Invitations"
          description={
            <span>
              Your Stitch team is all set. Get started by bringing in your team
              members to explore Stitch with you.
            </span>
          }
          footer={this.renderFooter()}
        >
          {showError && (
            <HelpBlock className="text-left error-text">
              <i className="fa fa-exclamation-circle" /> {emailErrorText}
            </HelpBlock>
          )}
          <Form onSubmit={this.onNext}>
            <div className="invite-form-label-wrapper">
              <span>Email Address</span>
              <Button className="link" onClick={this.onAddEmail}>
                Add Invitation
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
                      onKeyPress={this.onKeyPress}
                      placeholder="Email address"
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
        </AuthenticationPage>
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
