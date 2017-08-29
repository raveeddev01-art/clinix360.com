import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@inject("sidemenuStore")
@observer
class Lockout extends Component {
  constructor(props) {
    super(props);

    this.state = { pin: "" };
  }

  resetPassword = () => {
    // const { history } = this.props;
    // history.push(`/reset-password`);
  };

  unlock = () => {
    const { sidemenuStore } = this.props;

    sidemenuStore.unlock();
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    console.log("submit PIN");
  };

  render() {
    return (
      <div className="authentication-wrapper">
        <div id="lockout" className="authentication-card text-center">
          <div className="lockout-header">
            <a className="logout" href="/logout">
              <i className="fa fa-sign-out" />
            </a>
          </div>

          <h2>Session Paused</h2>

          <h5>
            Enter <strong>PIN</strong> to resume Stitch.
          </h5>

          <form className="m-b-40" onSubmit={this.handleSubmit}>
            <FormGroup bsSize="large">
              <FormControl
                name="pin"
                required
                autoFocus
                type="password"
                value={this.state.pin}
                onChange={this.handleChange}
              />
            </FormGroup>

            <Button
              type="submit"
              bsStyle="primary"
              bsSize="lg"
              className="btn-block"
            >
              Enter
            </Button>

            <HelpBlock>
              Forgot your PIN? Just enter your password.<br />
              Forgot both? Reset your password{" "}
              <a role="link" onClick={this.resetPassword}>
                here
              </a>.
            </HelpBlock>
          </form>

          <p className="copyright m-b-0">
            &copy; 2017 Stitch Technologies, Inc
          </p>
        </div>
      </div>
    );
  }
}

export default withRouter(Lockout);
