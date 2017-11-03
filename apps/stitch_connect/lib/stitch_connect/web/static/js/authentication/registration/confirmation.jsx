import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer, inject } from "mobx-react";
import { parse } from "qs";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Alert from "react-bootstrap/lib/Alert";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import InputGroup from "react-bootstrap/lib/InputGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@inject("registrationStore")
@observer
export default class Confirmation extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      error: false,
      digits: new Array(6).fill("")
    };
  }

  componentWillMount() {
    const { search } = this.props.location;
    if (search) {
      const query = parse(search.substr(1));
      if (query.userId) {
        this.props.registrationStore.userId = query.userId;
      }
    }
  }

  onChangeCode = index => event => {
    this.replaceCode(index, event.target.value, () => this.moveRight(index));
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
        this.submitConfirmationCode();
      });
    }
  };

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
      this.submitConfirmationCode();
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

  submitConfirmationCode = () => {
    const confirmationCode = this.state.digits.join("");
    if (confirmationCode.length === 6) {
      post("/api/v1/users/submit-confirmation-code", {
        body: {
          user_id: this.props.registrationStore.userId,
          confirmation_code: confirmationCode
        }
      })
        .then(() => {
          this.setState({ error: false });
          this.props.history.push("/signup/team-name");
        })
        .catch(() => {
          this.setState({ error: true });
        });
    }
  };

  renderCodeInput = (from, to) => {
    const comps = [];
    for (let i = from; i < to; i += 1) {
      comps.push(
        <input
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
        {this.state.error && (
          <Alert>
            The confirmation code doesn&#39;t match the one we have on record.
            Please check your email again.
          </Alert>
        )}

        <div className="authentication-card text-center">
          <div className="card-header">
            <Row>
              <Col xs={12} className="text-right">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="close">Close</Tooltip>}
                >
                  <Link to="/getstarted">
                    <i className="fa fa-close" />
                  </Link>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>

          <h2>Check your email!</h2>

          <h5>
            Enter your <strong>confirmation code</strong>.
          </h5>

          <form>
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

            <HelpBlock className="m-b-20">
              We sent a six-digit confirmation code to&nbsp;
              <strong>{this.props.registrationStore.email}</strong> to verify
              your email address.
            </HelpBlock>
          </form>
        </div>
      </div>
    );
  }
}
