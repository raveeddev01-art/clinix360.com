import React, { Component, PropTypes } from "react";
import FILE_TYPES from "../file-types";
import DefaultFileAttachment from "./default";
import ImageFileAttachment from "./image";

const FileAttachmentRenderer = {
  File: DefaultFileAttachment,
  Image: ImageFileAttachment
};

class FileAttachment extends Component {
  getFileType = mimetype =>
    FILE_TYPES[mimetype] || {
      icon: "fa fa-file-o"
    };

  render() {
    const { mimetype } = this.props;
    const filetype = this.getFileType(mimetype);
    const Renderer =
      FileAttachmentRenderer[filetype.type] || FileAttachmentRenderer.File;

    return <Renderer {...this.props} />;
  }
}

FileAttachment.propTypes = {
  mimetype: PropTypes.string
};

export default FileAttachment;
