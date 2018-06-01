import React, { Component } from "react";
import PropTypes from "prop-types";

import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardPage } from "common/components";
import { mobile } from "../../../lib/browser_details";

class CarespaceNameCard extends Component {
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
        Name your carespace after the group that will be using Stitch together
        (you can change this later).
      </span>
    );
  }

  render() {
    const { value } = this.state;

    return (
      <OnboardPage
        {...this.props}
        title="What is your carespace name?"
        onNext={this._onNext}
        description={this.renderDesc()}
        disableNext={!value}
      >
        <FormGroup bsSize="large">
          <ControlLabel>Carespace Name</ControlLabel>
          <FormControl
            required
            autoFocus={!mobile}
            type="text"
            placeholder="Ex. Care Clinic."
            value={value}
            onChange={this._onChange}
            maxLength={80}
          />
        </FormGroup>
      </OnboardPage>
    );
  }
}

CarespaceNameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  value: PropTypes.string
};

CarespaceNameCard.defaultProps = {
  children: "",
  value: ""
};

export default CarespaceNameCard;
