import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import InputGroup from "react-bootstrap/lib/InputGroup";

class PinInput extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      digits: new Array(4).fill("")
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.pin !== nextProps.pin) {
      this.setDigits(nextProps.pin);
    }
  }

  onChangeCode = index => event => {
    this.replaceCode(index, event.target.value, () => this.moveRight(index));
  };

  onKeyDown = index => event => {
    const specialKeys = [8, 37, 39, 46];
    if (specialKeys.includes(event.keyCode)) {
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
      .substr(0, 3);
    if (text.length === 4 && !isNaN(text)) {
      this.setState({ digits: text.split("") }, () => {
        this.digitComponents[3].focus();
        this.submitConfirmationCode();
      });
    }
  };

  setDigits = pin => {
    if (!pin || !pin.length) {
      this.setState({
        digits: new Array(4).fill("")
      });
    } else {
      this.setState({
        digits: pin.split("")
      });
    }
  };

  replaceCode = (index, value, callback = () => {}) => {
    const { digits } = this.state;
    if (!isNaN(value)) {
      this.props.onInvalid();
      this.setState(
        {
          digits: [...digits.slice(0, index), value, ...digits.slice(index + 1)]
        },
        callback
      );
    }
  };

  submitConfirmationCode = () => {
    const code = this.state.digits.join("");
    this.props.onValid(code);
    this.digitComponents[0].focus();
  };

  moveLeft = index => {
    if (index > 0) {
      this.digitComponents[index - 1].focus();
      this.digitComponents[index - 1].select();
    }
  };

  moveRight = index => {
    if (index < 3) {
      this.digitComponents[index + 1].focus();
      this.digitComponents[index + 1].select();
    } else if (index === 3) {
      this.submitConfirmationCode();
    }
  };

  digitComponents = {};

  renderCodeInput = (from, to) => {
    const comps = [];
    for (let i = from; i < to; i += 1) {
      comps.push(
        <input
          type="password"
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
      <InputGroup className={cx("pin-code", this.props.className)}>
        {this.renderCodeInput(0, 4)}
      </InputGroup>
    );
  }
}

PinInput.propTypes = {
  onValid: PropTypes.func.isRequired,
  onInvalid: PropTypes.func.isRequired,
  className: PropTypes.string,
  pin: PropTypes.string.isRequired
};

PinInput.defaultProps = {
  onValid: () => {},
  onInvalid: () => {},
  className: "",
  pin: ""
};

export default PinInput;
