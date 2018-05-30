import React, { Component } from "react";
import PropTypes from "prop-types";

import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardPage } from "common/components";

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

  _onNext = () => {
    if (this.state.value) {
      this.props.onNext(this.state.value);
    }
  };

  renderDesc() {
    return (
      <span>
        Name your team after the group that will be using Stitch together (You
        can change this later).
      </span>
    );
  }

  render() {
    const { value } = this.state;
    const { type, isRequired, disableNext } = this.props;

    return (
      <div>
        <OnboardPage
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
              maxLength={80}
            />
          </FormGroup>
        </OnboardPage>
      </div>
    );
  }
}

TeamNameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
  disableNext: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool
};

TeamNameCard.defaultProps = {
  onNext: () => {},
  children: "",
  type: "text",
  value: "",
  disableNext: false,
  isRequired: true
};

export default TeamNameCard;
