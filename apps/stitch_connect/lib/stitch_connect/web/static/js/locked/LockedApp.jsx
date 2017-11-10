import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Alert from "react-bootstrap/lib/Alert";
import PinInput from "../common/components/pin-input/index";

@inject("presenceStore")
@observer
class LockedApp extends Component {
  constructor(props) {
    super(props);

    this.state = { pin: "", hasError: false };
  }

  onInvalid = () => {
    this.setState({ pin: "", hasError: false });
  };

  onValid = pin => {
    this.setState({ pin }, () => {
      if (pin.length === 4) {
        this.attemptUnlock();
      }
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.attemptUnlock();
  };

  attemptUnlock = () => {
    this.props.presenceStore.unlock(this.state.pin).catch(() => {
      this.setState({ pin: "", hasError: true });
    });
  };

  render() {
    const { hasError } = this.state;
    return (
      <div className="locked-app-wrapper">
        <div className="authentication-wrapper">
          {hasError && <Alert bsStyle="danger">PIN is incorrect.</Alert>}

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

              <HelpBlock>
                Forgot your PIN? Just enter your password.<br />
                Forgot both? Reset your password{" "}
                <a href="/reset-password">here</a>.
              </HelpBlock>
            </form>

            <p className="copyright m-b-0">
              &copy; 2017 Stitch Technologies, Inc
            </p>
          </div>
        </div>
      </div>
    );
  }
}
export default LockedApp;
