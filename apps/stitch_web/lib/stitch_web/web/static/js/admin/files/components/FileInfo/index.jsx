import React, { Component } from "react";
import PropTypes from "prop-types";
import prettyBytes from "pretty-bytes";
import moment from "moment";

class FileInfo extends Component {
  render() {
    const file = this.props.file;
    const prettySize = prettyBytes(file.size_in_bytes);
    const extension = file.filetype;
    const addedOn = moment(file.inserted_at).format("D MMMM, YYYY");
    const accessPerm = file.public ? "" : "This file is private";

    return (
      <span className="file-info">
        {prettySize} {extension} added on {addedOn}. {accessPerm}
      </span>
    );
  }
}

FileInfo.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileInfo;
