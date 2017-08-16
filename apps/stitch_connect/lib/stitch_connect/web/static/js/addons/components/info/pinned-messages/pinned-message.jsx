import React, { PropTypes } from "react";
import moment from "moment";

const PinnedMessage = ({ message }) => {
  const { text_content, pinned_by, pinned_at } = message;
  const userName = `${pinned_by.first_name} ${pinned_by.last_name}`;
  const pinnedAtFormatted = moment(pinned_at).calendar(null, {
    lastWeek: "MMM Do",
    sameElse: "MMM Do"
  });

  return (
    <div className="pinned-message">
      <div className="pinned-message-header">
        {userName}&nbsp;&nbsp;
        <span className="time">{pinnedAtFormatted}</span>
      </div>

      <div className="pinned-message-content">
        {text_content}
      </div>
    </div>
  );
};

PinnedMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default PinnedMessage;
