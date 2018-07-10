import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Avatar } from "common/components";
import FileAttachment from "common/components/messages/message-content/file-attachment";
import AttachmentActions from "common/components/messages/message-content/file-attachment/components/attachment-actions";
import FileComment from "admin/files/components/FileComment";
import FileCommentInput from "admin/files/components/FileCommentInput";
import FileCommentGroup from "admin/files/components/FileCommentGroup";

@inject("teamFileStore", "usersStore", "groupsStore", "desktopStore")
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
        <a href={url} target="_blank">
          Open public link
        </a>

        <a onClick={this.props.teamFileStore.revokePublicLink}>
          <i className="fa fa-times-circle" />
        </a>
      </small>
    );
  }

  render() {
    const { file } = this.props.teamFileStore;

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
                fileId={file.id}
                user_id={file.user_id}
                commentCount={file.comment_count}
                onFileDownload={this.onFileDownload}
              />
            </div>
            <div className="file-heading__content-user">
              {fileCreator.full_name}{" "}
            </div>
            <div className="file-heading__content-file">{file.filename}</div>
          </div>
        </div>
        <FileCommentGroup file={file} />
        {this.renderPublicLink(file)}
        <FileAttachment
          api_url={file.url}
          fileId={file.id}
          size="sm"
          {...file}
        />
        {file.comments.map(comment => (
          <FileComment comment={comment} key={comment.id} />
        ))}
        <FileCommentInput file={file} />
      </div>
    );
  }
}

export default FileDetails;
