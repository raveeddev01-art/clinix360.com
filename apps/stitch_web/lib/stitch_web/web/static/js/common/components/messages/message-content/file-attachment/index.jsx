import React, { Component } from "react";
import PropTypes from "prop-types";
import getFileType from "../file-types";
import DefaultFileAttachment from "./default";
import ImageFileAttachment from "./image";

const FileAttachmentRenderer = {
  File: DefaultFileAttachment,
  Image: ImageFileAttachment
};

class FileAttachment extends Component {
  onCommentsClick = e => {
    e.stopPropagation();
    e.preventDefault();
    if (this.props.onCommentsClick) {
      this.props.onCommentsClick()
    }
  }

  render() {
    const { mimetype } = this.props;
    const filetype = getFileType(mimetype);
    const Renderer =
      FileAttachmentRenderer[filetype.title] || FileAttachmentRenderer.File;

    return <Renderer {...this.props} onCommentsClick={e => this.onCommentsClick(e)} />;
  }
}

FileAttachment.propTypes = {
  mimetype: PropTypes.string.isRequired
};

export default FileAttachment;
