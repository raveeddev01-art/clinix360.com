import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Alert from "react-bootstrap/lib/Alert";
import { OnboardCard } from "common/components";

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
      phone: evt.target.value
    });
  };

  onNext = () => {
    // removed validation temporarily.
    // TODO add frontend validation
    this.props.onNext(this.state.phone);
  };

  render() {
    const { phone, hasError, loading } = this.state;

    return (
      <div>
        {hasError && (
          <Alert bsStyle="danger">This phone number is invalid.</Alert>
        )}

        <OnboardCard
          {...this.props}
          title="Phone Number"
          description={
            <span>
              Enter your <strong>phone number</strong>.
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
