import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import PinInput from "../common/components/pin-input/index";

@inject("presenceStore")
@observer
class LockedApp extends Component {
  constructor(props) {
    super(props);

    this.state = { pin: "", formValid: false };
  }

  onInvalid = () => {
    this.setState({ formValid: false, pin: "" });
  };

  onValid = pin => {
    this.setState({
      pin,
      formValid: pin.length === 4
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.props.presenceStore.unlock(this.state.pin).catch(() => {
      this.setState({ pin: "", formValid: false });
    });
  };

  render() {
    return (
      <div className="authentication-wrapper">
        <div id="lockout" className="authentication-card text-center">
          <div className="lockout-header">
            {this.props.presenceStore.unlocking ? (
              <span className="unlocking">
                <i className="fa fa-circle-o-notch fa-spin" />
              </span>
            ) : (
              <a className="logout" href="/logout">
                <i className="fa fa-sign-out" />
              </a>
            )}
          </div>

          <h2>Session Paused</h2>

          <h5>
            Enter <strong>PIN</strong> to resume Stitch.
          </h5>

          <form className="m-b-40" onSubmit={this.handleSubmit}>
            <PinInput
              className="m-b-20 m-center"
              onValid={this.onValid}
              onInvalid={this.onInvalid}
            />

            <Button
              type="submit"
              bsStyle="primary"
              bsSize="lg"
              className="btn-block"
              disabled={!this.state.formValid}
            >
              Enter
            </Button>

            <HelpBlock>
              Forgot your PIN? Just enter your password.<br />
              Forgot both? Reset your password{" "}
              <Link to="/reset-password">
                here
              </Link>.
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
export default LockedApp;
