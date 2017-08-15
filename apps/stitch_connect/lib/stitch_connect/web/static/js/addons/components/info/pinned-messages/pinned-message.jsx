import React, { PropTypes } from "react";
import moment from "moment";

const PinnedMessage = ({ message }) => {
  const { text, pinnedBy, pinnedAt } = message;
  const userName = `${pinnedBy.firstName} ${pinnedBy.lastName}`;
  const pinnedAtFormatted = moment(pinnedAt).calendar(null, {
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
        {text}
      </div>
    </div>
  );
};

PinnedMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default PinnedMessage;
