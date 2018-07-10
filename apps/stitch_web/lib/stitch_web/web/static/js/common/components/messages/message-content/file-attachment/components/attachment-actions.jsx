import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";
import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import CopyToClipboard from "react-copy-to-clipboard";
import { isAdminOrOwner } from "lib/utils";

@inject("messageStore", "teamFileStore")
@observer
class AttachmentActions extends Component {
  createPublicLink = () => {
    const { teamFileStore, fileId } = this.props;
    teamFileStore.createPublicLink(fileId);
  };

  revokePublicLink = () => {
    const { teamFileStore, fileId } = this.props;
    teamFileStore.revokePublicLink(fileId);
  };

  delete = () => {
    const { teamFileStore, fileId } = this.props;
    teamFileStore.deleteFile(fileId);
  };

  shareFile = () => {
    const { fileId, teamFileStore } = this.props;
    teamFileStore.openShareModal(fileId);
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
      public_url,
      user_id
    } = this.props;

    return (
      <div
        className="attachment-actions btn-group"
        onClick={this.stopPropagation}
      >
        {onCommentsClick && (
          <OverlayTrigger
            placement="top"
            delayShow={150}
            overlay={<Tooltip id="file-comments">Add Comment</Tooltip>}
          >
            <Button onClick={onCommentsClick}>
              <i className="fa fa-comments" />
            </Button>
          </OverlayTrigger>
        )}

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

            {message && (
              <MenuItem onClick={this.togglePin}>
                <span>
                  <i className="fa fa-thumb-tack fa-rotate-45" />&nbsp;{message.pinned ? "Unpin" : "Pin"}{" "}
                  message
                </span>
              </MenuItem>
            )}

            <CopyToClipboard text={url} onCopy={this.copy}>
              <MenuItem>
                <span>
                  <i className="fa fa-paste" />&nbsp;Copy Link
                </span>
              </MenuItem>
            </CopyToClipboard>

            {!public_url && (
              <MenuItem onClick={this.createPublicLink}>
                <span>
                  <i className="fa fa-external-link" />&nbsp;Create External
                  Link
                </span>
              </MenuItem>
            )}

            {public_url && (
              <MenuItem onClick={this.revokePublicLink}>
                <span>
                  <i className="fa fa-minus-circle" />&nbsp;Revoke External Link
                </span>
              </MenuItem>
            )}

            {isAdminOrOwner(user_id) && <MenuItem divider />}

            {onCommentsClick && (
              <MenuItem onClick={onCommentsClick}>
                <span>
                  <i className="fa fa-info" />&nbsp;View Details
                </span>
              </MenuItem>
            )}

            {isAdminOrOwner(user_id) && (
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
  user_id: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  message: PropTypes.object,
  onCommentsClick: PropTypes.func,
  onFileDownload: PropTypes.func.isRequired
};

AttachmentActions.defaultProps = {
  onCommentsClick: null,
  public_url: null,
  message: null
};

export default AttachmentActions;
