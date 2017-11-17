import React, { Component } from "react";
import { observer, inject } from "mobx-react";
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
      this.props.registrationStore.setCookie(
        response.data.id,
        this.state.email
      );
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

  render() {
    return (
      <OnboardCard
        title="Email"
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
