import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

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
    const authWrapperClass = cx("authentication-page", {
      "on-electron": window.electronApp
    });
    const { hasError, isSaving } = this.state;

    return (
      <div className={authWrapperClass}>
        <div>
          <AuthenticationPage
            headerCTA="no-cta"
            title="Locked Out"
            description="Enter your PIN to resume using Stitch."
          >
            <div className="locked-out">
              <Form onSubmit={this.handleSubmit}>
                <FormGroup
                  bsSize="large"
                  validationState={(this.state.hasError && "error") || null}
                >
                  <ControlLabel>PIN</ControlLabel>
                  <PinInput
                    className="m-b-20 m-center"
                    pin={this.state.pin}
                    onValid={this.onValid}
                    onInvalid={this.onInvalid}
                  />
                  {hasError && (
                    <HelpBlock className="text-left">
                      <i className="fa fa-exclamation-circle" /> PIN is
                      incorrect
                    </HelpBlock>
                  )}
                </FormGroup>

                <Button
                  type="submit"
                  bsStyle="primary"
                  bsSize="lg"
                  className="btn btn-block btn-onboarding m-center m-b-20"
                  disabled={isSaving}
                >
                  Unlock
                  {this.renderLoadingIcon()}
                </Button>
              </Form>

              <HelpBlock className="onboarding-hint m-b-20">
                Can't remember your PIN?{" "}
                <a href="/logout">
                  <strong>Sign Out</strong>
                </a>
              </HelpBlock>
            </div>
          </AuthenticationPage>
        </div>
      </div>
    );
  }
}

export default LockedApp;
