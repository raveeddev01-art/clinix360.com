import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Alert from "react-bootstrap/lib/Alert";
import Header from "../website/components/header";
import Footer from "../website/components/footer";
import PinInput from "../common/components/pin-input/index";

@inject("presenceStore", "teamStore")
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
    const lockAppWrapperClass = cx("locked-app-wrapper", {
      "on-electron": window.electronApp
    });

    const { hasError } = this.state;
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
                  onValid={this.onValid}
                  onInvalid={this.onInvalid}
                />
              </form>

              <HelpBlock>
                Can't remember your PIN? <a href="/logout">Sign Out</a>
              </HelpBlock>
            </div>
          </div>
        </div>
        {!window.electronApp && <Footer />}
      </div>
    );
  }
}
export default LockedApp;
