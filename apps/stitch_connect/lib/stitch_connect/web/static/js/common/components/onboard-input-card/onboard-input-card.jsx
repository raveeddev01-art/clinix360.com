import React, { Component } from "react";
import PropTypes from "prop-types";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../onboard-card/onboard-card";

class OnboardInputCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    };
  }

  _onChange = evt => {
    const value = evt.target.value;
    this.setState({ value });
  };

  _onFocus = evt => {
    const tempValue = evt.target.value;

    evt.target.value = "";
    evt.target.value = tempValue;
  };

  _onNext = () => this.props.onNext(this.state.value);

  render() {
    const { value } = this.state;
    const {
      type,
      helperText,
      placeholder,
      isRequired,
      children,
      disableNext,
      maxLength,
      ...otherProps
    } = this.props;
    return (
      <OnboardCard
        {...otherProps}
        onNext={this._onNext}
        description={children}
        disableNext={disableNext || (isRequired && !value)}
      >
        <FormGroup bsSize="large">
          <FormControl
            required={isRequired}
            autoFocus
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={this._onChange}
            onFocus={this._onFocus}
            maxLength={maxLength}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">{helperText}</HelpBlock>
      </OnboardCard>
    );
  }
}

OnboardInputCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  nextButtonText: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  helperText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
  disableNext: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool,
  maxLength: PropTypes.number
};

OnboardInputCard.defaultProps = {
  onNext: () => {},
  children: "",
  title: "",
  placeholder: "",
  helperText: "",
  nextButtonText: "Next",
  type: "text",
  value: "",
  disableNext: false,
  isRequired: true,
  maxLength: undefined
};

export default OnboardInputCard;
