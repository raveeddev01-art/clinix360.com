import React from "react";
import PropTypes from "prop-types";
import capitalize from "lodash/capitalize";

import { FREQUENCIES } from "../constants";
import Toggle from "../../../../common/components/toggle/Toggle";

const FrequencyToggle = ({ frequency, onToggle }) => {
  return (
    <div className="frequency-toggle">
      <Toggle
        onToggle={onToggle}
        on={capitalize(FREQUENCIES[1].title)}
        off={capitalize(FREQUENCIES[0].title)}
        active={frequency}
      />

      <div className="frequency-description">
        {frequency
          ? "Billed annually or monthly with an 1 year contract"
          : "Billed monthly with no contract"}
      </div>
    </div>
  );
};

FrequencyToggle.propTypes = {
  frequency: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default FrequencyToggle;
