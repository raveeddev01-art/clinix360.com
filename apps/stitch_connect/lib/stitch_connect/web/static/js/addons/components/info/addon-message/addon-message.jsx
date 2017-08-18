import React, { PropTypes } from "react";
import moment from "moment";

const AddonMessage = ({ message }) => {
  const {
    text_content: text,
    user: { first_name: firstName, last_name: lastName },
    inserted_at: insertedAt
  } = message;
  const userName = `${firstName} ${lastName}`;
  const timestamp = moment(insertedAt).calendar(null, {
    lastWeek: "MMM Do",
    sameElse: "MMM Do"
  });

  return (
    <div className="addon-message">
      <div className="addon-message-header">
        {userName}&nbsp;&nbsp;
        <span className="time">{timestamp}</span>
      </div>

      <div className="addon-message-content">
        {text}
      </div>
    </div>
  );
};

AddonMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default AddonMessage;
