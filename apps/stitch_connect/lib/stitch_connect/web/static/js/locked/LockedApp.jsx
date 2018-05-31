import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";

import { AuthenticationPage, PinInput, LoadingIcon } from "common/components";

@inject("presenceStore", "teamStore")
@observer
class LockedApp extends Component {
  constructor(props) {
    super(props);

    this.state = { pin: "", hasError: false, isSaving: false };
  }

  onInvalid = () => {
    this.setState({ hasError: false });
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

    return isSaving && <LoadingIcon className="on-right" />;
  };

  render() {
    const authWrapperClass = cx("authentication-wrapper", {
      "on-electron": window.electronApp
    });
    const { hasError, isSaving } = this.state;

    return (
      <div className={authWrapperClass}>
        <div>
          <AuthenticationPage
            title="Session Locked"
            description={`${this.props.teamStore.slug}.teamstitch.com`}
            errorText={hasError && "PIN is incorrect"}
          >
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
          </AuthenticationPage>
        </div>
      </div>
    );
  }
}

export default LockedApp;
