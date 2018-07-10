import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { confirmModal } from "common/modals";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";
import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import CopyToClipboard from "react-copy-to-clipboard";
import { isAdmin } from "lib/utils";

@inject("messageStore", "teamFileStore")
@observer
class AttachmentActions extends Component {
  delete = () => {
    confirmModal({
      title: "Delete File",
      message:
        "Are you sure you want to delete this file? This cannot be undone.",
      okLabel: "Delete"
    }).then(() => {
      const { message, messageStore } = this.props;

      messageStore.delete(message.id);
    });
  };

  shareFile = () => {
    const { message } = this.props;
    this.props.teamFileStore.openShareModal(message.upload_id);
  };

  togglePin = () => {
    const { messageStore, message } = this.props;

    messageStore.togglePin(message.id);
  };

  stopPropagation = e => {
    e.stopPropagation();
  };

  render() {
    const {
      url,
      onCommentsClick,
      onFileDownload,
      message,
      public_url
    } = this.props;
    const mine = message.user.id === currentUser.id;

    return (
      <div
        className="attachment-actions btn-group"
        onClick={this.stopPropagation}
      >
        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="file-comments">Add Comment</Tooltip>}
        >
          <Button onClick={onCommentsClick}>
            <i className="fa fa-comments" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="download-file">Download</Tooltip>}
        >
          <Button target="_blank" href={url} onClick={onFileDownload}>
            <i className="fa fa-download" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="message-actions">More Actions</Tooltip>}
        >
          <DropdownButton
            pullRight
            noCaret
            title={<i className="fa fa-ellipsis-h" />}
            id="file-actions-dropdown"
            onToggle={this.onToggleContextualMenu}
          >
            <MenuItem onClick={this.shareFile}>
              <span>
                <i className="fa fa-share" />&nbsp;Share File
              </span>
            </MenuItem>

            <MenuItem onClick={this.togglePin}>
              <span>
                <i className="fa fa-thumb-tack fa-rotate-45" />&nbsp;{message.pinned ? "Unpin" : "Pin"}{" "}
                message
              </span>
            </MenuItem>

            <CopyToClipboard text={url} onCopy={this.copy}>
              <MenuItem>
                <span>
                  <i className="fa fa-paste" />&nbsp;Copy Link
                </span>
              </MenuItem>
            </CopyToClipboard>

            {public_url && (
              <MenuItem target="_blank" href={public_url}>
                <span>
                  <i className="fa fa-external-link" />&nbsp;External Link
                </span>
              </MenuItem>
            )}

            {(mine || isAdmin()) && <MenuItem divider />}

            <MenuItem onClick={onCommentsClick}>
              <span>
                <i className="fa fa-info" />&nbsp;View Details
              </span>
            </MenuItem>

            {(mine || isAdmin()) && (
                <MenuItem onClick={this.delete}>
                  <span>
                    <i className="fa fa-trash" />&nbsp;Delete File
                  </span>
                </MenuItem>
              )}
          </DropdownButton>
        </OverlayTrigger>
      </div>
    );
  }
}

AttachmentActions.propTypes = {
  url: PropTypes.string.isRequired,
  public_url: PropTypes.string,
  message: PropTypes.object.isRequired,
  onCommentsClick: PropTypes.func,
  onFileDownload: PropTypes.func.isRequired
};

AttachmentActions.defaultProps = {
  onCommentsClick: () => undefined,
  public_url: null
};

export default AttachmentActions;
