import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { Card } from "common/components";

function pageReload() {
  location.reload();
}

@inject("resetPasswordStore", "titleStore")
@observer
class SendEmail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      sent: false,
      error: ""
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Reset Password");
  }

  _onChange = evt => this.setState({ email: evt.target.value });
  _onSubmit = evt => {
    evt.preventDefault();
    this.props.resetPasswordStore
      .sendEmail(this.state.email)
      .then(() => {
        this.setState({
          sent: true
        });
      })
      .catch(err => {
        this.setState({
          error: err.data.message,
          sent: true
        });
      });
  };

  renderToSend() {
    const { email, error } = this.state;

    return (
      <div>
        <Card
          errorText={error}
          title="Password Reset"
          footer={<div />}
          description={
            <span>
              Enter the email address you use to sign in to{" "}
              <b>{document.location.hostname}</b>.
            </span>
          }
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
      </div>
    );
  }

  renderSent() {
    const { email } = this.state;

    return (
      <Card
        title="Check Your Email!"
        className="password-reset-check-email wide"
        footer={<div />}
        description={
          <span>
            We've emailed instructions on how to reset your password to
            {email}. Click the link to confirm your address and get started.{" "}
            <br />
            <br /> Wrong email? Please{" "}
            <button className="btn-link" onClick={pageReload}>
              re-enter your address
            </button>.
          </span>
        }
      />
    );
  }

  render() {
    return !this.state.sent ? this.renderToSend() : this.renderSent();
  }
}

export default SendEmail;
