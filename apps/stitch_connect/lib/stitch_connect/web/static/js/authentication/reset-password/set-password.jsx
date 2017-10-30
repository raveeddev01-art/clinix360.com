import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import Button from "react-bootstrap/lib/Button";
import Card from "../components/card/card";
import PasswordValidator from "../../common/components/password-validator/index";

@inject("resetPasswordStore", "titleStore")
@observer
class SetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
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
    this.props.resetPasswordStore
      .resetPassword(this.state.password)
      .then(() => {
        this.props.history.push("/login");
      });
  };

  render() {
    const { password } = this.state;
    return (
      <Card
        title="Reset Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
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
