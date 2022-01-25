import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

@inject("groupsStore", "teamFileStore")
@observer
class MessageCommentGroup extends Component {

  render() {
    const { message, label, groupsStore } = this.props;
    console.log(this.props, "this.props message")
    const groups = groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        message.group_id === group.id
    );

    return (
      <small className="file-comment__groups">
        {groups.length ? (
          label
        ) : message.public ? (
          <span className="file-comment__group-item">File</span>
        ) : (
          <span className="file-comment__group-item">Private File</span>
        )}
        {groups.map(group => (
          <span key={group.id} className="file-comment__group-item">
            <Link to={`/rooms/${group.slug}`}>
              <i
                className={`file-comment__group-item__icon fa fa-${group.public
                  ? "comments"
                  : "lock"}`}
              />
              {groupsStore.getGroupName(group)}
            </Link>
          </span>
        ))}
      </small>
    );
  }
}

MessageCommentGroup.propTypes = {
  message: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  showClose: PropTypes.bool.isRequired
};

MessageCommentGroup.defaultProps = {
  label: "Shared in",
  showClose: true
};

export default MessageCommentGroup;
