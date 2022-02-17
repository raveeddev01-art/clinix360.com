import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { prettyFileSize } from "lib/utils";

class FileInfo extends Component {
  render() {
    const { file } = this.props;
    const prettySize = prettyFileSize(file.size_in_bytes);
    const extension = file.filename.split('.').pop();
    const addedOn = moment(file.inserted_at).format("D MMMM, YYYY");

    return (
      <small className="file-info">
        <span className="file-comment__group-item">{addedOn}</span>
        <span className="file-comment__group-item">
          {prettySize} {extension.toUpperCase()}
        </span>
      </small>
    );
  }
}

FileInfo.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileInfo;
