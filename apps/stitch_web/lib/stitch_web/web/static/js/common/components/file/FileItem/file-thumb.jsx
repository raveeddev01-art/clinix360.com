import React, { Component } from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import getFileType from "lib/file-types";

class FileThumb extends Component {
  render() {
    const { className, previewUrl, mimetype } = this.props;
    const filetype = getFileType(mimetype);

    if (previewUrl && filetype.title === "Image") {
      const style = {
        backgroundImage: `url("${previewUrl}")`
      };

      return <div className={cx("file-thumb", className)} style={style} />;
    }

    return (
      <div className="file-thumb-icon">
        <i className={filetype.icon} />
      </div>
    );
  }
}

FileThumb.propTypes = {
  className: PropTypes.string,
  mimetype: PropTypes.string,
  previewUrl: PropTypes.string
};

FileThumb.defaultProps = {
  previewUrl: "",
  mimetype: "",
  className: ""
};

export default FileThumb;
