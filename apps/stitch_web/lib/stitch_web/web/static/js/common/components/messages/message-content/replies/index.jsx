import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";

@inject("usersStore", "addonStore")
class Replies extends Component {

    showFileComments = () => {
        const { addonStore, message } = this.props;
    
        addonStore.setAddonPanel("files");
        addonStore.toggleAddons(true);
        addonStore.toggleAddonDetail(true);
        addonStore.setAddonDetailPanel("File Details", message);
    };
    
    showMessageComments = () => {
        const { addonStore, message } = this.props;
    
        addonStore.setAddonPanel("thread");
        addonStore.toggleAddons(true);
        addonStore.toggleAddonDetail(false);
        addonStore.setAddonDetailPanel("Message Details", message);
    };

  render() {
    const message = this.props.message;
    if (!message.thread_messages_count) {
      return null;
    }

    return (
      <div className="thread-messages-count">
        <span onClick={(message.type === "upload" || message.type === "file_comment") ? this.showFileComments : this.showMessageComments}>
            {message.thread_messages_count} {message.thread_messages_count > 1 ? "replies" : "reply"}
        </span>
      </div>
    );
  }
}

Replies.propTypes = {
    message: PropTypes.object
};

Replies.defaultProps = {
    message: null
};

export default Replies;
