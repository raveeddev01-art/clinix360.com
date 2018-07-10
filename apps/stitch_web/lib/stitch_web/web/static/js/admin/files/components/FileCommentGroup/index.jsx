import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

@inject("groupsStore")
@observer
class FileCommentGroup extends Component {
  onUnshareClick(group) {
    this.props.teamFileStore.unshare(group.id);
  }

  render() {
    const { file, label, showClose } = this.props;
    const groups = this.props.groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        file.shared_in.includes(group.id)
    );

    if (groups.length === 0) {
      return null;
    }

    return (
      <small className="file-comment__groups">
        {label}
        {groups.map(group => (
          <span key={group.id} className="file-comment__group-item">
            <Link to={`/rooms/${group.slug}`}>
              {group.public ? "#" : "(Private) "}
              {group.slug}
            </Link>
            {showClose && (
              <a onClick={() => this.onUnshareClick(group)}>
                <i className="fa fa-minus-circle" />
              </a>
            )}
          </span>
        ))}
      </small>
    );
  }
}

FileCommentGroup.propTypes = {
  file: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  showClose: PropTypes.bool.isRequired
};

FileCommentGroup.defaultProps = {
  label: "Shared in",
  showClose: true
};

export default FileCommentGroup;
