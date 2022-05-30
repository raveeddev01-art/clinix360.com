import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import MessageComment from "common/components/message/MessageComment";
import MessageCommentInput from "common/components/message/MessageCommentInput";
import MessageCommentGroup from "common/components/message/MessageCommentGroup";
import Message from "../../../chat/message-list/message";
import FileInfo from "common/components/file/FileInfo";

@inject("teamFileStore", "usersStore", "groupsStore", "desktopStore", "messageStore")
@observer
class FileDetails extends Component {
  onFileDownload = e => {
    const { file } = this.props.teamFileStore;
    const { desktopStore } = this.props;

    if (desktopStore.isElectron) {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();

      desktopStore.sendDownloadRequest({
        id: file.id,
        url: file.api_url,
        filename: file.filename,
        mimetype: file.mimetype,
        filetype: file.filetype,
        previewUrl: file.preview_url
      });
    }
  };

  renderPublicLink(file) {
    if (!file.public_url) {
      return null;
    }

    const url = file.public_url;

    return (
      <small className="file-comment__groups">
        <span className="file-dot" />
        <a className="no-margin" href={url} target="_blank">
          Open public link
        </a>

        <a onClick={() => this.props.teamFileStore.revokePublicLink()}>
          <i className="fa fa-times-circle" />
        </a>
      </small>
    );
  }

  render() {
    const { messageStore, teamFileStore, usersStore } = this.props;
    const { file } = teamFileStore;
    const { message } = messageStore;

    if (!file.id) return null;
    const fileCreator = usersStore.usersById[file.user_id];

    return (
      <div className="search-results-addon">
        <div className="file-heading">
          <Message
            inThread={true}
            edited_at={message.edited_at}
            isReply={true}
            messageUser={fileCreator}
            pinned={message.pinned}
            starred={message.starred}
            status={message.status}
            is_sequential={message.is_sequential}
            reactions_web={message.reactions_web}
            link_previews={message.link_previews}
            key={`message_${message.id}`}
            message={message}
            messageStore={messageStore}
            chatDiv={messageStore.chatDiv}
            onMounted={messageStore.onMessageMounted}
            onUnmounted={messageStore.onMessageUnmounted}
            onShow={messageStore.onMessageShow}
            onHide={messageStore.onMessageHide}
            messageClass={"file-details"}
          />
        </div>
        <FileInfo file={file} />
        <span className="file-dot" />
        <MessageCommentGroup message={message} />
        {this.renderPublicLink(file)}
        <span className="spacer-10" />
        {message.thread_messages && message.thread_messages.map(comment => (
          <MessageComment comment={comment} key={comment.id} />
        ))}
        <MessageCommentInput message={message} />
      </div>
    );
  }
}

export default FileDetails;
