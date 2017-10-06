import React, { Component } from "react";
import { inject } from "mobx-react";

@inject("sidemenuStore")
class MessageFooter extends Component {
  getGroup() {
    const { sidemenuStore, message } = this.props;

    return sidemenuStore.getGroupById(message.group_id);
  }

  render() {
    const group = this.getGroup();

    return (
      <div className="message-footer">
        <a href={`/rooms/${group.slug}`}>
          <i className="fa fa-tag" /> {group.name}
        </a>
      </div>
    );
  }
}

export default MessageFooter;
