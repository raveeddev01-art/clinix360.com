import React, { Component, PropTypes } from "react";
import OnboardInputCard from "../onboard-input-card/onboard-input-card.jsx";

class PinCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="PIN"
        description={
          <span>
            Enter a <strong>4-digit PIN</strong>.
          </span>
        }
        type="password"
        helperText="You can use this pin when your screen is locked after a period of inactivity."
        placeholder="0000"
      />
    );
  }
}

PinCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

PinCard.defaultProps = {
  onNext: () => {}
};

export default PinCard;
