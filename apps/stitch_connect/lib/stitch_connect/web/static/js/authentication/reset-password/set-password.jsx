import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import Button from "react-bootstrap/lib/Button";

import { Card, PasswordValidator } from "common/components";

@inject("resetPasswordStore", "titleStore")
@observer
class SetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      error: false,
      formValid: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Reset Password");
  }

  onChange = evt => {
    this.setState({
      password: evt.target.value
    });
  };

  onChangeValid = formValid => {
    this.setState({ formValid });
  };

  _onSubmit = evt => {
    evt.preventDefault();
    this.setState({ error: false });
    this.props.resetPasswordStore
      .resetPassword(this.state.password)
      .then(() => {
        this.props.history.push("/login", { passwordReset: true });
      })
      .catch(err => {
        this.setState({
          error:
            err.data && err.data.errors && err.data.errors.password
              ? err.data.errors.password[0]
              : "Unknown server error"
        });
      });
  };

  render() {
    const { password, error } = this.state;
    return (
      <Card
        title="Reset Password"
        errorText={error}
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
        footer={<div />}
      >
        <Form onSubmit={this._onSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              type="password"
              placeholder="Password"
              value={password}
              onChange={this.onChange}
            />
          </FormGroup>
          <PasswordValidator
            password={password}
            onChangeValid={this.onChangeValid}
          />
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
            disabled={this.state.formValid}
          >
            Submit
          </Button>
        </Form>
      </Card>
    );
  }
}

export default SetPassword;
