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
  render() {
    const { mimetype } = this.props;
    const filetype = getFileType(mimetype);
    const Renderer =
      FileAttachmentRenderer[filetype.title] || FileAttachmentRenderer.File;

    return <Renderer {...this.props} />;
  }
}

FileAttachment.propTypes = {
  mimetype: PropTypes.string.isRequired
};

export default FileAttachment;
