import React, { Component } from "react";
import PropTypes from "prop-types";
import { OnboardInputCard } from "common/components";

class TeamNameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="Team Name"
        helperText="This is the name of your team. It will show up in menus and headings."
        placeholder="Ex. Care Clinic"
      >
        Enter your <strong>team name</strong>.
      </OnboardInputCard>
    );
  }
}

TeamNameCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

TeamNameCard.defaultProps = {
  onNext: () => {}
};

export default TeamNameCard;
