import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { OnboardCard } from "common/components";

class NameCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      firstName: "",
      lastName: ""
    };
  }

  onChange = field => evt => {
    this.setState({
      [field]: evt.target.value
    });
  };

  onNext = () => {
    this.props.onNext({
      firstname: this.state.firstName,
      lastname: this.state.lastName
    });
  };

  render() {
    const { firstName, lastName } = this.state;

    return (
      <OnboardCard
        {...this.props}
        title="Name"
        description={
          <span>
            Enter your <strong>full name</strong>.
          </span>
        }
        disableNext={!firstName || !lastName}
        onNext={this.onNext}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            placeholder="First Name"
            value={firstName}
            maxLength={80}
            onChange={this.onChange("firstName")}
          />
        </FormGroup>
        <FormGroup bsSize="large">
          <FormControl
            required
            placeholder="Last Name"
            value={lastName}
            maxLength={80}
            onChange={this.onChange("lastName")}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          Your full name will be shown in the team directory and next to your
          profile and messages.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

NameCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

NameCard.defaultProps = {
  onNext: () => {}
};

export default NameCard;
