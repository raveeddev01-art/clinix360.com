import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import getFileType from "lib/file-types";
import { getFullUrl, prettyFileSize } from "lib/utils";
import { FILE_VIEW_SIZE_LIMIT } from "lib/constants";
import AttachmentActions from "./components/attachment-actions";
import FileViewer from "./file-viewer";

@inject("desktopStore")
class DefaultFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onAttachmentClick = e => {
    const {
      desktopStore,
      onFileDownload,
      encoded_id,
      useActions,
      url
    } = this.props;

    if (this.hasViewer() && this.isAllowedForPreview()) {
      this.setState({ showModal: !this.state.showModal });
    } else if (this.hasViewer() && useActions && !desktopStore.isElectron) {
      const detailPageUrl = getFullUrl(`/admin/files/${encoded_id}`);
      window.open(detailPageUrl);
    } else if (useActions && desktopStore.isElectron) {
      onFileDownload(e);
    } else if (useActions) {
      window.open(url);
    }
  };

  onHideModal = () => this.setState({ showModal: false });

  hasViewer = () => {
    const { mimetype } = this.props;
    const fileType = getFileType(mimetype);
    return ["PDF Document"].includes(fileType.title);
  };

  isAllowedForPreview = () => {
    const { mimetype } = this.props;
    const fileType = getFileType(mimetype);
    return this.props.size_in_bytes < FILE_VIEW_SIZE_LIMIT[fileType.title];
  };

  render() {
    const { showModal } = this.state;
    const {
      desktopStore,
      filename,
      mimetype,
      size_in_bytes: size,
      url,
      file_id,
      user_id,
      preview_url,
      encoded_id,
      public_url,
      comment_count: commentCount,
      isConversationMessage,
      onCommentsClick,
      onFileDownload,
      useActions,
      message
    } = this.props;
    const filetype = getFileType(mimetype);
    let hoverIcon = "";
    let hoverText = filetype.title;
    let mainCN = "attachment-block attachment-block--noaction";

    if (this.hasViewer() && this.isAllowedForPreview()) {
      hoverText = "- Click to view";
      hoverIcon = "search";
      mainCN = "attachment-block attachment-block--view";
    } else if (this.hasViewer() && useActions && !desktopStore.isElectron) {
      hoverText = "- Click to open original";
      hoverIcon = "external-link";
      mainCN = "attachment-block";
    } else if (useActions) {
      hoverText = "- Click to download";
      hoverIcon = "arrow-down";
      mainCN = "attachment-block";
    }

    return (
      <div>
        {/* {useActions && <span className="text-muted">uploaded this file: </span>} */}
        <div className={mainCN} onClick={this.onAttachmentClick}>
          <div className="attachment-icon">
            <i className={filetype.icon} />
            <i className={`fa attachment-icon__hover fa-${hoverIcon}`} />
          </div>
          <div className="attachment-description">
            <div className="attachment-title">
              <strong>{filename}</strong>
            </div>
            <div className="attachment-detail">
              {prettyFileSize(size)}&nbsp;
              <span className="attachment-detail__normal">
                {filetype.title}
              </span>
              <span className="attachment-detail__hover">{hoverText}</span>
            </div>

            {this.hasViewer() && (
              <div
                className="attachment-thumb"
                style={{ backgroundImage: `url(${preview_url})` }}
              />
            )}
          </div>

          {useActions &&
            message && (
              <AttachmentActions
                url={url}
                file_id={file_id}
                user_id={user_id}
                encoded_id={encoded_id}
                public_url={public_url}
                message={message}
                commentCount={commentCount}
                isActionsVisible={isConversationMessage ? false : undefined}
                isOriginalOpenVisible={
                  isConversationMessage ? false : undefined
                }
                onCommentsClick={onCommentsClick}
                onFileDownload={onFileDownload}
              />
            )}
        </div>

        {this.hasViewer() &&
          this.isAllowedForPreview() && (
            <FileViewer
              {...this.props}
              type={filetype.title}
              show={showModal}
              onHideModal={this.onHideModal}
            />
          )}
      </div>
    );
  }
}

DefaultFileAttachment.propTypes = {
  filename: PropTypes.string.isRequired,
  mimetype: PropTypes.string.isRequired,
  size_in_bytes: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  preview_url: PropTypes.string,
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  isConversationMessage: PropTypes.bool.isRequired,
  onFileDownload: PropTypes.func.isRequired,
  useActions: PropTypes.bool,
  user_id: PropTypes.number.isRequired,
  encoded_id: PropTypes.string,
  public_url: PropTypes.string,
  file_id: PropTypes.number.isRequired,
  message: PropTypes.object
};

DefaultFileAttachment.defaultProps = {
  encoded_id: "",
  public_url: "",
  preview_url: "",
  useActions: true,
  message: null,
  comment_count: 0,
  isConversationMessage: false,
  onCommentsClick: undefined
};

export default DefaultFileAttachment;
