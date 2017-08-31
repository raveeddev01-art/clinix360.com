import React, { Component, PropTypes } from "react";
import { inject } from "mobx-react";
import moment from "moment";

import MessageText from "../../../common/components/message-text/message-text";

@inject("sidemenuStore")
class File extends Component {
  getGroup() {
    const { sidemenuStore, file } = this.props;

    return sidemenuStore.getGroupById(file.group_id);
  }

  render() {
    const { file } = this.props;
    const {
      user: { first_name: firstName, last_name: lastName },
      inserted_at: insertedAt
    } = this.props.file;
    const userName = `${firstName} ${lastName}`;
    const timestamp = moment(insertedAt).calendar(null, {
      lastWeek: "MMM Do",
      sameElse: "MMM Do"
    });

    const group = this.getGroup();

    return (
      <div className="addon-message">
        <div className="addon-message-header">
          {userName}&nbsp;&nbsp;
          <span className="time">{timestamp}</span>
        </div>

        <div className="addon-message-content">
          <MessageText message={file} />
          <div className="group">
            <a href={`/groups/${group.slug}`}>
              <i className="fa fa-tag" /> {group.name}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

File.propTypes = {
  file: PropTypes.object.isRequired
};

export default File;
