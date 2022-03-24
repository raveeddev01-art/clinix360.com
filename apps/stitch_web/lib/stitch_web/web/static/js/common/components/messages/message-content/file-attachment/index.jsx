import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import getFileType from "lib/file-types";
import DefaultFileAttachment from "./default";
import ImageFileAttachment from "./image";
import VideoFileAttachment from "./video";

const FileAttachmentRenderer = {
  File: DefaultFileAttachment,
  Image: ImageFileAttachment,
  "Video File": VideoFileAttachment
};

@inject("desktopStore", "teamFileStore")
class FileAttachment extends Component {
  onCommentsClick = e => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.props.onCommentsClick();
  };

  onFileDownload = e => {
    const {
      desktopStore,
      teamFileStore,
      api_url,
      url,
      preview_url,
      filename,
      mimetype,
      filetype,
      file_id
    } = this.props;

    if (desktopStore.isElectron) {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();

      desktopStore.sendDownloadRequest({
        id: file_id,
        url: api_url,
        filename,
        mimetype,
        filetype,
        previewUrl: preview_url
      });
    } else {
      teamFileStore.downloadFile(url, filename)
    }
  };

  render() {
    const { mimetype, onCommentsClick } = this.props;
    const filetype = getFileType(mimetype);
    const Renderer =
      FileAttachmentRenderer[filetype.title] || FileAttachmentRenderer.File;

    return (
      <Renderer
        {...this.props}
        onCommentsClick={onCommentsClick ? this.onCommentsClick : undefined}
        onFileDownload={this.onFileDownload}
      />
    );
  }
}

FileAttachment.propTypes = {
  api_url: PropTypes.string,
  preview_url: PropTypes.string,
  mimetype: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  filetype: PropTypes.string.isRequired,
  file_id: PropTypes.number.isRequired,
  message: PropTypes.object,
  onCommentsClick: PropTypes.func
};

FileAttachment.defaultProps = {
  onCommentsClick: undefined,
  api_url: undefined,
  preview_url: "",
  message: null
};

export default FileAttachment;
