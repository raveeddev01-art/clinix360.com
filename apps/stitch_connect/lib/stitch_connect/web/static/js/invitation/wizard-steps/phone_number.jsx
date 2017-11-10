import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Alert from "react-bootstrap/lib/Alert";
import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class PhoneNumberCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      phone: this.props.invitationStore.phone,
      hasError: false
    };
  }

  onChange = evt => {
    this.setState({
      phone: evt.target.value
    });
  };

  onNext = () => {
    post(`/api/v1/users/validate_phone_number`, {
      body: { phone_number: this.state.phone }
    })
      .then(() => {
        this.setState({ hasError: false });
        this.props.invitationStore.phone = this.state.phone;
        this.props.onNext();
      })
      .catch(() => {
        this.setState({ hasError: true });
      });
  };

  render() {
    const { phone, hasError } = this.state;
    const { onBack, onRestart } = this.props;

    return (
      <div>
        {hasError && (
          <Alert bsStyle="danger">This phone number is invalid.</Alert>
        )}

        <OnboardCard
          title="Phone Number"
          description={
            <span>
              Enter your <strong>phone number</strong>.
            </span>
          }
          onNext={this.onNext}
          onBack={onBack}
          onRestart={onRestart}
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
  onBack: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired
};

PhoneNumberCard.defaultProps = {
  onNext: () => {},
  onBack: () => {},
  onRestart: () => {}
};

export default PhoneNumberCard;
