import React, { PropTypes } from "react";
import moment from "moment";

import MessageText from "../../../common/components/message-text/message-text";

const File = ({ file }) => {
  const {
    user: { first_name: firstName, last_name: lastName },
    inserted_at: insertedAt
  } = file;
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
        <MessageText message={file} />
      </div>
    </div>
  );
};

File.propTypes = {
  file: PropTypes.object.isRequired
};

export default File;
