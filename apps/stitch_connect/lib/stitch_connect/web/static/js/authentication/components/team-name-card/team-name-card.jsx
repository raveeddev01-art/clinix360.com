import React, { Component } from "react";
import PropTypes from "prop-types";

import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../../../common/components/onboard-card/onboard-card";

class TeamNameCard extends Component {
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

  renderDesc() {
    return (
      <span>
        Name your team after the group that will be using Stitch together.
      </span>
    );
  }

  render() {
    const { value } = this.state;
    const { type, isRequired, disableNext, maxLength } = this.props;

    return (
      <div>
        <OnboardCard
          {...this.props}
          title="What is your team name?"
          onNext={this._onNext}
          description={this.renderDesc()}
          disableNext={disableNext || (isRequired && !value)}
        >
          <FormGroup bsSize="large">
            <ControlLabel>Team Name</ControlLabel>
            <FormControl
              required={isRequired}
              autoFocus
              type={type}
              placeholder="Ex. Care Clinic."
              value={value}
              onChange={this._onChange}
              onFocus={this._onFocus}
              maxLength={maxLength}
            />
          </FormGroup>
          <HelpBlock className="onboarding-hint m-b-20">
            You can change this later
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

TeamNameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  nextButtonText: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  helperText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
  disableNext: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool,
  maxLength: PropTypes.number
};

TeamNameCard.defaultProps = {
  onNext: () => {},
  children: "",
  title: "",
  placeholder: "",
  helperText: "",
  type: "text",
  value: "",
  nextButtonText: null,
  disableNext: false,
  isRequired: true,
  maxLength: undefined
};

export default TeamNameCard;
