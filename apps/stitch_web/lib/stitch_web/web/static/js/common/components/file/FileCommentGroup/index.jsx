import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import { confirmModal } from "common/modals";

@inject("groupsStore", "teamFileStore")
@observer
class FileCommentGroup extends Component {
  onUnshareClick = group => {
    const { groupsStore } = this.props;
    return confirmModal({
      title: "Un-share File",
      message: `Are you sure you want to un-share this file from the ${groupsStore.getGroupName(
        group
      )} room?
          Unsharing the file will prevent future comments from displaying in the room, but will not remove the existing message and comments.`,
      okLabel: "OK"
    })
      .then(() => {
        return this.props.teamFileStore.unshare(group.id);
      })
      .catch(() => {});
  };

  render() {
    const { file, label, showClose, groupsStore } = this.props;
    const groups = groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        file.shared_in.includes(group.id)
    );

    if (!showClose && !groups.length) {
      return <span />;
    }

    return (
      <small className="file-comment__groups">
        {groups.length ? (
          label
        ) : file.public ? null : (
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
              {group.slug}
            </Link>
            {showClose && (
              <OverlayTrigger
                placement="top"
                delayShow={150}
                overlay={
                  <Tooltip id="close-share">
                    Unshare from {groupsStore.getGroupName(group)}
                  </Tooltip>
                }
              >
                <a onClick={() => this.onUnshareClick(group)}>
                  <i className="fa fa-minus-circle" />
                </a>
              </OverlayTrigger>
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
