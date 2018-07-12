import React, { Component } from "react";
import PropTypes from "prop-types";
import history from "lib/history";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { UserProfileMenu } from "common/components";
import AttachmentActions from "common/components/messages/message-content/file-attachment/components/attachment-actions";
import FileInfo from "../FileInfo";
import FileCommentGroup from "../FileCommentGroup";
import FileThumb from "./file-thumb";

@inject("usersStore", "desktopStore")
@observer
class FileItem extends Component {
  onFileDownload = e => {
    const { desktopStore, file } = this.props;

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

  onClick = e => {
    const { onFileClick, file } = this.props;

    if (e.target && e.target.nodeName === "A") {
      return;
    }

    if (onFileClick) {
      onFileClick(file.id);
    } else {
      history.push(`/admin/files/${file.encoded_id}`);
    }
  };

  renderName = user => {
    if (user.is_bot) {
      return user.username;
    }

    return user.full_name;
  };

  render() {
    const { file, usersStore, isActionsVisible, onFileClick } = this.props;
    const user = usersStore.usersById[file.user_id];
    const username = user && this.renderName(user);

    return (
      <div className="file-item" onClick={this.onClick}>
        <FileThumb mimetype={file.mimetype} previewUrl={file.preview_url} />
        <div className="file-item__content">
          {isActionsVisible && (
            <div className="pull-right">
              <AttachmentActions
                url={file.url}
                file_id={file.id}
                user_id={file.user_id}
                encoded_id={file.encoded_id}
                isOriginalOpenVisible={false}
                commentCount={file.comment_count}
                onFileDownload={this.onFileDownload}
              />
            </div>
          )}

          {onFileClick ? (
            <a onClick={() => onFileClick(file.id)} className="file-item__link">
              {file.filename}
            </a>
          ) : (
            <Link
              className="file-item__link"
              to={`/admin/files/${file.encoded_id}`}
            >
              {file.filename}
            </Link>
          )}

          <div className="file-item__content-user">
            <span onClick={e => e.stopPropagation()}>
              {isActionsVisible ? (
                <UserProfileMenu user={user} className="name">
                  {username}
                </UserProfileMenu>
              ) : (
                username
              )}
            </span>
          </div>

          <FileInfo file={file} />
          <span className="file-dot" />
          <FileCommentGroup file={file} showClose={false} />
        </div>
      </div>
    );
  }
}

FileItem.propTypes = {
  file: PropTypes.object.isRequired,
  isActionsVisible: PropTypes.bool,
  onFileClick: PropTypes.func
};

FileItem.defaultProps = {
  onFileClick: null,
  isActionsVisible: true
};

export default FileItem;
