import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Alert from "react-bootstrap/lib/Alert";
import isEmail from "validator/lib/isEmail";
import { OnboardCard } from "common/components";

@inject("registrationStore")
@observer
class EmailCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: "",
      formValid: false,
      loading: false,
      errorMessage: ""
    };
  }

  onNext = () => {
    this.setState({ loading: true });
    post("/api/v1/users", {
      body: { email: this.state.email },
      hideNotify: true
    })
      .then(response => {
        this.props.registrationStore.setCookie(
          response.data.id,
          this.state.email
        );
        return post("/api/v1/users/send-confirmation-code", {
          body: { id: response.data.id }
        }).then(() => {
          this.props.history.push("/signup/confirmation-code");
          this.setState({ loading: false });
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          errorMessage: err.data ? err.data.message : err.message
        });
      });
  };

  onChange = evt => {
    this.setState({
      email: evt.target.value,
      formValid: isEmail(evt.target.value)
    });
  };

  render() {
    return (
      <div>
        {this.state.errorMessage && (
          <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
        )}
        <OnboardCard
          title="Email"
          description={
            <span>
              Enter your <strong>email address</strong>.
            </span>
          }
          onNext={this.onNext}
          loading={this.state.loading}
          disableNext={!this.state.formValid}
        >
          <FormGroup bsSize="large">
            <FormControl
              name={`email_${new Date().getTime()}`}
              required
              autoFocus
              autoComplete="off"
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.onChange}
            />
          </FormGroup>
          <HelpBlock className="m-b-20">
            We will send you a confirmation code to verify your email. If your
            team already has an account, ask your administrator for an
            invitation.
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

export default EmailCard;
