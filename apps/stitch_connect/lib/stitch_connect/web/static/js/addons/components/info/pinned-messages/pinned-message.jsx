import React, { PropTypes } from "react";
import moment from "moment";

const PinnedMessage = ({ message }) => {
  const {
    text_content: text,
    pinned_by: pinnedBy,
    inserted_at: insertedAt
  } = message;
  const userName = `${pinnedBy.first_name} ${pinnedBy.last_name}`;
  const timestamp = moment(insertedAt);

  return (
    <div className="pinned-message">
      <div className="pinned-message-header">
        {userName}&nbsp;&nbsp;
        <span className="time">{timestamp}</span>
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
