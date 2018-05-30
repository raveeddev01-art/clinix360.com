import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { observer, inject } from "mobx-react";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import InputGroup from "react-bootstrap/lib/InputGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { OnboardPage } from "common/components";

@inject("registrationStore")
@observer
class Confirmation extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      error: false,
      digits: new Array(6).fill(""),
      loading: false
    };
  }

  componentWillMount() {
    const { registrationStore, history } = this.props;
    if (!registrationStore.verifyCookie()) {
      history.replace(`/signup/email`);
    }
  }

  onChangeCode = index => event => {
    this.replaceCode(index, event.target.value, () => {
      this.moveRight(index);
      this.checkAndSubmit();
    });
  };

  onKeyDown = index => event => {
    const specialKeys = [8, 37, 39, 46];
    const char = String.fromCharCode(event.keyCode);
    if (
      (specialKeys.includes(event.keyCode) || isNaN(char)) &&
      !(char.toLowerCase() === "v" && (event.metaKey || event.ctrlKey))
    ) {
      event.preventDefault();
    }

    switch (event.keyCode) {
      case 8: // backspace
        this.replaceCode(index, "");
        this.moveLeft(index);
        break;
      case 37: // left
        this.moveLeft(index);
        break;
      case 39: // right
        this.moveRight(index);
        break;
      case 46: // delete
        this.replaceCode(index, "");
        break;
      default:
    }
  };

  onPaste = evt => {
    const text = evt.clipboardData
      .getData("Text")
      .trim()
      .replace(/[^0-9]/g, "")
      .substr(0, 6);
    if (text.length === 6 && !isNaN(text)) {
      this.setState({ digits: text.split("") }, () => {
        this.digitComponents[5].focus();
        this.checkAndSubmit();
      });
    }
  };

  get errorText() {
    return "The confirmation code doesn't match the one we have on record. Please check your email again.";
  }

  digitComponents = {};

  moveLeft = index => {
    if (index > 0) {
      this.digitComponents[index - 1].focus();
      this.digitComponents[index - 1].select();
    }
  };

  moveRight = index => {
    if (index < 5) {
      this.digitComponents[index + 1].focus();
      this.digitComponents[index + 1].select();
    } else if (index === 5) {
      this.checkAndSubmit();
    }
  };

  replaceCode = (index, value, callback = () => {}) => {
    const { digits } = this.state;
    this.setState(
      {
        digits: [...digits.slice(0, index), value, ...digits.slice(index + 1)]
      },
      callback
    );
  };

  checkAndSubmit = () => {
    const { registrationStore, history } = this.props;
    const confirmationCode = this.state.digits.join("");
    if (confirmationCode.length === 6) {
      this.setState({ loading: true });
      post("/api/v1/users/submit-confirmation-code", {
        body: {
          user_id: registrationStore.userId,
          confirmation_code: confirmationCode
        },
        hideNotify: true
      })
        .then(() => {
          registrationStore.verified = true;
          // TODO: REMOVE THIS COMMENT
          // THIS IS CHANGED
          history.push("/signup/onboarding/names");
        })
        .catch(() => {
          this.setState({ error: true, loading: false });
        });
    }
  };

  get hasSixDigits() {
    return this.state.digits && this.state.digits.join("").length === 6;
  }

  renderCodeInput = (from, to) => {
    const comps = [];
    for (let i = from; i < to; i += 1) {
      comps.push(
        <input
          pattern="\d*"
          inputMode="numeric"
          className="form-control"
          autoFocus={i === 0}
          key={`code_${i}`}
          value={this.state.digits[i]}
          onChange={this.onChangeCode(i)}
          onKeyDown={this.onKeyDown(i)}
          ref={input => {
            this.digitComponents[i] = input;
          }}
          onPaste={this.onPaste}
          maxLength="1"
        />
      );
    }
    return comps;
  };

  render() {
    return (
      <div>
        <OnboardPage
          title="Check your email!"
          description={
            <span>
              We've sent a six-digit confirmation code to{" "}
              <strong>{this.props.registrationStore.email}</strong>. Enter it
              below to confirm your email address.
            </span>
          }
          loading={this.state.loading}
          onNext={this.onNext}
          disableNext={!this.hasSixDigits}
        >
          <ControlLabel>Confirmation Code</ControlLabel>
          <div className="confirmation-code m-b-20">
            <InputGroup className="code-group">
              {this.renderCodeInput(0, 3)}
            </InputGroup>

            <div className="code-separator">—</div>

            <InputGroup className="code-group">
              {this.renderCodeInput(3, 6)}
            </InputGroup>
            <div className="clearfix" />
          </div>
          {this.state.error && (
            <div className="input-error">{this.errorText}</div>
          )}
          <HelpBlock className="onboarding-hint m-b-20">
            Keep this window open while you check for your code.
          </HelpBlock>
        </OnboardPage>
      </div>
    );
  }
}

export default withRouter(Confirmation);
