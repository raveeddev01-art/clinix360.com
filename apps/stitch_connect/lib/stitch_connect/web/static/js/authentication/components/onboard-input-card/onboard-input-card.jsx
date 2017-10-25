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
      value: ""
    };
  }

  _onChange = evt => this.setState({ value: evt.target.value });

  _onNext = () => this.props.onNext(this.state.value);

  render() {
    const { value } = this.state;
    const { type, helperText, placeholder, ...otherProps } = this.props;
    return (
      <OnboardCard {...otherProps} onNext={this._onNext}>
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={this._onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">{helperText}</HelpBlock>
      </OnboardCard>
    );
  }
}

OnboardInputCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  nextButtonText: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  helperText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  disableNext: PropTypes.bool.isRequired
};

OnboardInputCard.defaultProps = {
  onNext: () => {},
  description: "",
  title: "",
  placeholder: "",
  helperText: "",
  nextButtonText: "Next",
  type: "text",
  disableNext: false
};

export default OnboardInputCard;
