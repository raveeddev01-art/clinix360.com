import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FileAttachment from "../../../common/components/messages/message-content/file-attachment/index";
import FileComment from "../../../files/FileComment";
import FileCommentInput from "../../../files/FileCommentInput";
import FileHeading from "../../../files/FileHeading";

@inject("teamFileStore", "usersStore", "groupsStore")
@observer
class FileDetails extends Component {
  componentWillMount() {
    this.props.teamFileStore.load(this.props.fileId)
  }

  sharedInInfo(groups) {
    if (groups.length == 0) { return <span></span> }
    return (
      <span>
        Shared in
        {groups.map(group =>
          <span>
            <a href={`/rooms/${group.slug}`}>{group.public ? "#" : "(Private) "}{group.slug}</a> <a href={""}>(Unshare)</a>
          </span>
        )}
      </span>
    )
  }

  renderPublicLink(file) {
    const url = `${file.url}?public_token=${file.public_token}`;
    return <a href={url} target="_blank">Open public link</a>;
  }

  renderFile(file) {
    const fileCreator = this.props.usersStore.usersById[file.user_id];
    const groups = this.props.groupsStore.groups.filter(group =>
      group.type != "dm" && group.type != "multi_dm" && file.shared_in.includes(group.id)
    )

    return (
      <div>
        <FileHeading user={fileCreator} file={file} />
        {this.sharedInInfo(groups)}
        {this.renderPublicLink(file)}
        <FileAttachment api_url={file.url} {...file} />
        {file.comments.map(comment =>
          <FileComment comment={comment} key={comment.id} />
        )}
        <FileCommentInput file={file} />
      </div>
    )
  }

  render() {
    const file = this.props.teamFileStore.file;
    if (file.id) {
      debugger
    }

    return (
      <div className="search-results-addon">
        {file.id && this.renderFile(file)}

        <div className="footer">
        </div>
      </div>
    );
  }
}

export default FileDetails;
