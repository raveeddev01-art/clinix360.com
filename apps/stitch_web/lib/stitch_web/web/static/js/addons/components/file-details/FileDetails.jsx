import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Avatar, UserProfileMenu } from "common/components";
import FileAttachment from "common/components/messages/message-content/file-attachment";
import AttachmentActions from "common/components/messages/message-content/file-attachment/components/attachment-actions";
import FileComment from "common/components/file/FileComment";
import FileCommentInput from "common/components/file/FileCommentInput";
import FileCommentGroup from "common/components/file/FileCommentGroup";
import MessageComment from "common/components/message/MessageComment";
import MessageCommentInput from "common/components/message/MessageCommentInput";
import MessageCommentGroup from "common/components/message/MessageCommentGroup";
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
    const { file } = this.props.teamFileStore;
    const { message } = this.props.messageStore;

    if (!file.id) return null;

    const fileCreator = this.props.usersStore.usersById[file.user_id];

    return (
      <div className="file-details-addon">
        <div className="file-heading">
          <Avatar user={fileCreator} />
          <div className="file-heading__content">
            <div className="pull-right">
              <AttachmentActions
                url={file.url}
                file_id={file.id}
                user_id={file.user_id}
                public_url={file.public_url}
                message={message}
                encoded_id={file.encoded_id}
                commentCount={file.comment_count}
                onFileDownload={this.onFileDownload}
              />
            </div>
            <div className="file-heading__content-user">
              <UserProfileMenu user={fileCreator} className="name">
                {fileCreator.full_name}
              </UserProfileMenu>
            </div>
            <div>{message.text_content}</div>
            <div className="text-muted">{file.filename}</div>
          </div>
        </div>
        <FileAttachment
          api_url={file.api_url}
          file_id={file.id}
          size="sm"
          useActions={false}
          {...file}
        />
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
