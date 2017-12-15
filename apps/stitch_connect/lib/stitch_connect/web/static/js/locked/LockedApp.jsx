import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Header from "../authentication/components/header/header";
import Footer from "../authentication/components/footer/footer";
import PinInput from "../common/components/pin-input/index";

@inject("presenceStore", "teamStore")
@observer
class LockedApp extends Component {
  constructor(props) {
    super(props);

    this.state = { pin: "", hasError: false, isSaving: false };
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
    const { pin } = this.state;

    if (pin.length === 4) {
      this.setState({ isSaving: true });
      this.props.presenceStore.unlock(this.state.pin).catch(() => {
        this.setState({ pin: "", hasError: true, isSaving: false });
      });
    } else {
      this.setState({ hasError: true });
    }
  };

  renderLoadingIcon = () => {
    const { isSaving } = this.state;
    return isSaving ? (
      <i className="fa fa-circle-o-notch fa-spin fa-fw on-right" />
    ) : null;
  };

  render() {
    const lockAppWrapperClass = cx("locked-app-wrapper", {
      "on-electron": window.electronApp
    });

    const { hasError, isSaving } = this.state;
    return (
      <div className={lockAppWrapperClass}>
        <Header />
        <div className="authentication-wrapper">
          <div>
            {hasError && <Alert bsStyle="danger">PIN is incorrect.</Alert>}
            <div id="lockout" className="authentication-card text-center">
              <h2>Session Locked</h2>
              <h5 className="text-muted url-heading">
                {this.props.teamStore.slug}.teamstitch.com
              </h5>

              <h5>
                Enter <strong>PIN</strong> to resume Stitch.
              </h5>

              <form className="m-b-40" onSubmit={this.handleSubmit}>
                <PinInput
                  className="m-b-20 m-center"
                  pin={this.state.pin}
                  onValid={this.onValid}
                  onInvalid={this.onInvalid}
                />

                <Button
                  type="submit"
                  bsStyle="primary"
                  bsSize="lg"
                  className="btn-block m-center"
                  disabled={isSaving}
                >
                  Unlock
                  {this.renderLoadingIcon()}
                </Button>
              </form>

              <h5>
                Can't remember your PIN?{" "}
                <a href="/logout">
                  <strong>Sign Out</strong>
                </a>
              </h5>
            </div>
          </div>
        </div>
        {!window.electronApp && <Footer />}
      </div>
    );
  }
}
export default LockedApp;
