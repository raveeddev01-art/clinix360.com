import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { OnboardCard } from "common/components";

function formatNumber(numStr) {
  // allow: +1 (123) 456-7890 ext. #23*
  return numStr.replace(/[^0-9|\-|+|\(|\)|e|x|t|E|X|T|\.| |#|\*]/g, "");
}

class PhoneNumberCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      phone: "",
      hasError: false,
      loading: false
    };
  }

  onChange = evt => {
    this.setState({
      phone: formatNumber(evt.target.value)
    });
  };

  onNext = () => {
    // removed validation temporarily.
    // TODO add frontend validation
    this.props.onNext(this.state.phone);
  };

  get errorText() {
    return "This phone number is invalid.";
  }

  render() {
    const { phone, hasError, loading } = this.state;

    return (
      <div>
        <OnboardCard
          {...this.props}
          title="Phone Number"
          errorText={hasError && this.errorText}
          description={
            <span>
              Enter your <strong>phone number</strong>
            </span>
          }
          loading={loading}
          disableNext={!phone}
          onNext={this.onNext}
        >
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              placeholder="Phone Number"
              value={phone}
              onChange={this.onChange}
            />
          </FormGroup>
          <HelpBlock className="m-b-20">
            Your phone number will be shown in your profile so you can be
            reached.
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

PhoneNumberCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

PhoneNumberCard.defaultProps = {
  onNext: () => {}
};

export default PhoneNumberCard;
