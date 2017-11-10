import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Alert from "react-bootstrap/lib/Alert";
import OnboardCard from "../onboard-card/onboard-card";

class PhoneNumberCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      phone: "",
      hasError: false
    };
  }

  onChange = evt => {
    this.setState({
      phone: evt.target.value
    });
  };

  onNext = () => {
    post(`/api/v1/users/validate-phone-number`, {
      body: { phone_number: this.state.phone }
    })
      .then(() => {
        this.setState({ hasError: false });
        this.props.onNext(this.state.phone);
      })
      .catch(() => {
        this.setState({ hasError: true });
      });
  };

  render() {
    const { phone, hasError } = this.state;

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
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string.isRequired,
  restartUrl: PropTypes.string.isRequired
};

PhoneNumberCard.defaultProps = {
  onNext: () => {}
};

export default PhoneNumberCard;
