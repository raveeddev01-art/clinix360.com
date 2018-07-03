import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

import FileAttachment from "common/components/messages/message-content/file-attachment";
import FileComment from "admin/files/components/FileComment";
import FileCommentInput from "admin/files/components/FileCommentInput";
import FileHeading from "admin/files/components/FileHeading";

@inject("teamFileStore", "usersStore", "groupsStore")
@observer
class FileDetails extends Component {
  onUnshareClick(group) {
    this.props.teamFileStore.unshare(group.id);
  }

  renderSharedInInfo(groups) {
    if (!groups.length) {
      return <span />;
    }

    return (
      <span className="file-comment__groups">
        Shared in
        {groups.map(group => (
          <span key={group.id}>
            <Link to={`/rooms/${group.slug}`}>
              {group.public ? "#" : "(Private) "}
              {group.slug}
            </Link>{" "}
            <a onClick={() => this.onUnshareClick(group)}>(Unshare)</a>
          </span>
        ))}
      </span>
    );
  }

  renderPublicLink(file) {
    const url = `${file.url}?public_token=${file.public_token}`;
    return (
      <a href={url} target="_blank">
        Open public link
      </a>
    );
  }

  render() {
    const { file } = this.props.teamFileStore;

    if (!file.id) return null;

    const fileCreator = this.props.usersStore.usersById[file.user_id];
    const groups = this.props.groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        file.shared_in.includes(group.id)
    );

    return (
      <div className="file-details-addon">
        <FileHeading user={fileCreator} file={file} />
        {this.renderSharedInInfo(groups)}
        {this.renderPublicLink(file)}
        <FileAttachment api_url={file.url} {...file} />
        {file.comments.map(comment => (
          <FileComment comment={comment} key={comment.id} />
        ))}
        <FileCommentInput file={file} />
      </div>
    );
  }
}

export default FileDetails;
