import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import isEmail from "validator/lib/isEmail";
import { OnboardPage } from "common/components";

@inject("registrationStore")
@observer
class EmailCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      showCodePanel: true,
      email: "",
      formValid: false,
      loading: false,
      errorMessage: "",
      code: ""
    };
  }

  onSubmitCouponCode = (evt) => {
    if(evt === 'skip') {
      this.setState({ loading: false, showCodePanel: false });          
    } else {
      this.setState({ loading: true, errorMessage: "" });
      post("/api/v1/validate-coupon-code", {
        body: { code: this.state.code },
        hideNotify: true
      }).then(response => {
          console.log(response);
          if(response.data.success) {
            this.props.registrationStore.setCookie(
              response.data.id,
              this.state.email,
              this.state.code
            );
            this.setState({ loading: false, showCodePanel: false });          
          } else {
            this.setState({ loading: false, errorMessage: response.data.message });
          }
        })
        .catch(err => {
          this.setState({
            loading: false,
            errorMessage: err.data ? err.data.message : err.message
          });
        });
    }
  };

  onCodeChange = evt => {
    this.setState({
      code: evt.target.value,
      formValid: evt.target.value.length === 8,
    });
  };

  onNext = () => {
    this.setState({ loading: true });
    post("/api/v1/users", {
      body: { email: this.state.email, code: this.state.code },
      hideNotify: true
    })
      .then(response => {
        this.props.registrationStore.setCookie(
          response.data.id,
          this.state.email,
          this.state.code
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

  onSkip = evt => {
    evt.preventDefault();
    this.onSubmitCouponCode('skip')
  }

  renderCouponPanel() {
    const { errorMessage } = this.state;
    return (
      <div>
        <OnboardPage
          title="Create a new Workspace"
          description={
            <span>
              Enter your coupon code that you got from AppSummo.
            </span>
          }
          onNext={this.onSubmitCouponCode}
          loading={this.state.loading}
          disableNext={!this.state.formValid}
          onSkip={this.onSkip}
        >
          <FormGroup
            bsSize="large"
            validationState={(errorMessage && "error") || null}
          >
            <ControlLabel>Coupon Code</ControlLabel>
            <FormControl
              name={`couponcode_${new Date().getTime()}`}
              required
              autoFocus
              autoComplete="off"
              type="text"
              placeholder="Coupon Code"
              value={this.state.code}
              onChange={this.onCodeChange}
              maxLength="8"
            />
            {errorMessage && (
              <HelpBlock className="text-left">
                <i className="fa fa-exclamation-circle" />
                {errorMessage}
              </HelpBlock>
            )}
          </FormGroup>
        </OnboardPage>
      </div>
    );
  }


  renderEmailPanel() {
    const { errorMessage } = this.state;
    return (
      <div>
        <OnboardPage
          title="Create a new Workspace"
          description={
            <span>
              Enter your email address to start creating your Workspace on
              InvoChat.
            </span>
          }
          onNext={this.onNext}
          loading={this.state.loading}
          disableNext={!this.state.formValid}
        >
          <FormGroup
            bsSize="large"
            validationState={(errorMessage && "error") || null}
          >
            <ControlLabel>Email Address</ControlLabel>
            <FormControl
              name={`email_${new Date().getTime()}`}
              required
              autoFocus
              autoComplete="off"
              type="email"
              placeholder="Email address"
              value={this.state.email}
              onChange={this.onChange}
            />
            {errorMessage && (
              <HelpBlock className="text-left">
                <i className="fa fa-exclamation-circle" />
                {errorMessage}
              </HelpBlock>
            )}
          </FormGroup>
        </OnboardPage>
      </div>
    );
  }

  render() {
    return this.state.showCodePanel ? this.renderCouponPanel() : this.renderEmailPanel();
  }


  
}

export default EmailCard;
