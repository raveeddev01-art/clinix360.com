import React, { PropTypes } from "react";
import moment from "moment";

const PinnedMessage = ({ message }) => {
  const { text, pinnedBy, pinnedAt } = message;
  const userName = `${pinnedBy.first_name} ${pinnedBy.last_name}`;

  return (
    <div className="pinned-message">
      <div className="pinned-message-header">
        {userName}

        <span className="time">
          {moment(pinnedAt).format("HH:mm A")}
        </span>
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
