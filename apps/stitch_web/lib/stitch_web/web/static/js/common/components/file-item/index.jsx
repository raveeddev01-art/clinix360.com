import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { TimestampTooltip, UserProfileMenu } from "common/components";
import FileThumb from "./file-thumb";

@inject("usersStore")
@observer
class FileItem extends Component {
  _renderName = user => {
    if (user.is_bot) {
      return user.username;
    }

    return user.full_name;
  };

  render() {
    const { file, usersStore, onFileClick } = this.props;
    const user = usersStore.usersById[file.user_id];

    return (
      <div className="file-item">
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
            <UserProfileMenu user={user} className="name">
              {user && this._renderName(user)}
            </UserProfileMenu>
            <TimestampTooltip
              timestamp={file.inserted_at}
              className="time"
              format="MMM Do [at] h:mm A"
            />
          </div>
          <div className="file-item__content-file">
            {file.comment_count > 0 && `${file.comment_count} comments. `}
            {file.public ? "Public file" : "Private file"}
          </div>
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
