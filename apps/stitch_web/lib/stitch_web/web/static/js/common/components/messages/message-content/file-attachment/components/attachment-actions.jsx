import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Dropdown from "react-bootstrap/lib/Dropdown";
import CopyToClipboard from "react-copy-to-clipboard";
import { SmartDropdown, PortalDropdownMenu } from "common/components";
import { isAdminOrOwner, getFullUrl } from "lib/utils";

@inject("messageStore", "teamFileStore")
@observer
class AttachmentActions extends Component {
  createPublicLink = () => {
    const { teamFileStore, file_id } = this.props;
    teamFileStore.createPublicLink(file_id);
  };

  revokePublicLink = () => {
    const { teamFileStore, file_id } = this.props;
    teamFileStore.revokePublicLink(file_id);
  };

  delete = () => {
    const { teamFileStore, file_id } = this.props;
    teamFileStore.deleteFile(file_id);
  };

  shareFile = () => {
    const { file_id, teamFileStore } = this.props;
    teamFileStore.openShareModal(file_id);
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
      isOriginalOpenVisible,
      isDownloadVisible,
      message,
      public_url,
      encoded_id,
      user_id
    } = this.props;

    const detailPageUrl =
      encoded_id && getFullUrl(`/admin/files/${encoded_id}`);

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

        {isDownloadVisible && (
          <OverlayTrigger
            placement="top"
            delayShow={150}
            overlay={<Tooltip id="download-file">Download</Tooltip>}
          >
            <Button target="_blank" href={url} onClick={onFileDownload}>
              <i className="fa fa-download" />
            </Button>
          </OverlayTrigger>
        )}

        {isOriginalOpenVisible && (
          <OverlayTrigger
            placement="top"
            delayShow={150}
            overlay={<Tooltip id="detail-page">Open Original</Tooltip>}
          >
            <Button target="_blank" href={detailPageUrl}>
              <i className="fa fa-external-link" />
            </Button>
          </OverlayTrigger>
        )}

        <SmartDropdown id="file-actions-dropdown">
          <Dropdown.Toggle useAnchor noCaret>
            <OverlayTrigger
              placement="top"
              delayShow={150}
              overlay={<Tooltip id="message-actions">More Actions</Tooltip>}
            >
              <Button>
                <i className="fa fa-ellipsis-h" />
              </Button>
            </OverlayTrigger>
          </Dropdown.Toggle>
          <PortalDropdownMenu bsRole="menu">
            <MenuItem onClick={this.shareFile}>Share File</MenuItem>

            {message && (
              <MenuItem onClick={this.togglePin}>
                {message.pinned ? "Unpin" : "Pin"} message
              </MenuItem>
            )}

            <CopyToClipboard text={detailPageUrl} onCopy={this.copy}>
              <MenuItem>Copy Link</MenuItem>
            </CopyToClipboard>

            {!public_url && (
              <MenuItem onClick={this.createPublicLink}>
                Create External Link
              </MenuItem>
            )}

            {public_url && (
              <MenuItem onClick={this.revokePublicLink}>
                Revoke External Link
              </MenuItem>
            )}

            {public_url && (
              <MenuItem target="_blank" href={public_url}>
                Open Public Link
              </MenuItem>
            )}

            {isAdminOrOwner(user_id) && <MenuItem divider />}

            {onCommentsClick && (
              <MenuItem onClick={onCommentsClick}>View Details</MenuItem>
            )}

            {isAdminOrOwner(user_id) && (
              <MenuItem onClick={this.delete}>Delete File</MenuItem>
            )}
          </PortalDropdownMenu>
        </SmartDropdown>
      </div>
    );
  }
}

AttachmentActions.propTypes = {
  url: PropTypes.string.isRequired,
  public_url: PropTypes.string,
  user_id: PropTypes.number.isRequired,
  encoded_id: PropTypes.string,
  file_id: PropTypes.number.isRequired,
  message: PropTypes.object,
  isOriginalOpenVisible: PropTypes.bool.isRequired,
  isDownloadVisible: PropTypes.bool.isRequired,
  onCommentsClick: PropTypes.func,
  onFileDownload: PropTypes.func.isRequired
};

AttachmentActions.defaultProps = {
  encoded_id: "",
  isOriginalOpenVisible: true,
  isDownloadVisible: true,
  onCommentsClick: null,
  public_url: null,
  message: null
};

export default AttachmentActions;
