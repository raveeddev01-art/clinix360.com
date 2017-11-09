import React from "react";
import PropTypes from "prop-types";
import capitalize from "lodash/capitalize";

import { getAnnualFrequency, getMonthlyFrequency } from "../utils";
import Toggle from "../../../../common/components/toggle/Toggle";

const FrequencyToggle = ({ frequency, onToggle }) => {
  const annualFrequency = capitalize(getAnnualFrequency().title);
  const monthlyFrequency = capitalize(getMonthlyFrequency().title);

  return (
    <div className="frequency-toggle">
      <Toggle
        onToggle={onToggle}
        on={annualFrequency}
        off={monthlyFrequency}
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
