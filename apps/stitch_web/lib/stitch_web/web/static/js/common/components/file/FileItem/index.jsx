import React, { Component } from "react";
import PropTypes from "prop-types";
import history from "lib/history";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { UserProfileMenu } from "common/components";
import FileInfo from "../FileInfo";
import FileCommentGroup from "../FileCommentGroup";
import FileThumb from "./file-thumb";

@inject("usersStore")
@observer
class FileItem extends Component {
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
    const { file, usersStore, onFileClick } = this.props;
    const user = usersStore.usersById[file.user_id];

    return (
      <div className="file-item" onClick={this.onClick}>
        <FileThumb mimetype={file.mimetype} previewUrl={file.preview_url} />
        <div className="file-item__content">
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
            <span className="text-muted">Uploaded by&nbsp;</span>
            <span onClick={e => e.stopPropagation()}>
              <UserProfileMenu user={user} className="name">
                {user && this.renderName(user)}
              </UserProfileMenu>
            </span>
          </div>

          <FileInfo file={file} />
          <FileCommentGroup file={file} showClose={false} />
        </div>
      </div>
    );
  }
}

FileItem.propTypes = {
  file: PropTypes.object.isRequired,
  onFileClick: PropTypes.func
};

FileItem.defaultProps = {
  onFileClick: null
};

export default FileItem;
