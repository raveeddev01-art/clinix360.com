import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

@inject("groupsStore")
@observer
class FileCommentGroup extends Component {
  render() {
    const file = this.props.file;
    const groups = this.props.groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        file.shared_in.includes(group.id)
    );

    if (groups.length === 0) {
      return <span />;
    }

    return (
      <span className="file-comment__groups">
        Commenting in
        {groups.map(group => (
          <span key={group.id}>
            <Link to={`/rooms/${group.slug}`}>
              {group.public ? "#" : "(Private) "}
              {group.slug}
            </Link>
          </span>
        ))}
      </span>
    );
  }
}

FileCommentGroup.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileCommentGroup;
