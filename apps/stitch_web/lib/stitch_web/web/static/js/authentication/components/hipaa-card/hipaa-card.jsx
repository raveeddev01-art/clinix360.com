import React, { Component } from "react";
import PropTypes from "prop-types";
import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { OnboardPage } from "common/components";

class HipaaCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hipaaAgreed: false
    };
  }

  onChange = event => {
    this.setState({
      hipaaAgreed: event.target.checked
    });
  };

  render() {
    const { saving } = this.props;

    return (
      <div className="onboarding-hipaa">
        <OnboardPage
          title=""
          description={
            <span>
              By checking the box above, you represent that you agree to the
              terms of the Business Associate Agreement.
            </span>
          }
          loading={saving}
          disableNext={!this.state.hipaaAgreed}
          onNext={this.props.onNext}
        >
          <Checkbox
            name="hipaaAgreed"
            checked={this.state.hipaaAgreed}
            onChange={this.onChange}
            className="m-b-20"
          >
            I agree to the terms
          </Checkbox>

          <HelpBlock className="onboarding-hint m-b-20">
            By proceeding to use InvoChat, you agree to our&nbsp;
            <a href="/terms-of-service" target="_blank">
              Terms of Service
            </a>&nbsp;and&nbsp;
            <a href="/privacy-policy" target="_blank">
              Privacy Policy
            </a>.
          </HelpBlock>
        </OnboardPage>
      </div>
    );
  }
}

HipaaCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired
};

HipaaCard.defaultProps = {
  onNext: () => {},
  saving: false
};

export default HipaaCard;
