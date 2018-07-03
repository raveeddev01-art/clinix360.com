import React, { Component } from "react";
import cx from "classnames";
import PropTypes from "prop-types";

class FileThumb extends Component {
  render() {
    const { className, previewUrl } = this.props;
    const style = {
      backgroundImage: `url("${previewUrl}")`
    };

    return <div className={cx("file-thumb", className)} style={style} />;
  }
}

FileThumb.propTypes = {
  className: PropTypes.string,
  previewUrl: PropTypes.string
};

FileThumb.defaultProps = {
  previewUrl: "",
  className: ""
};

export default FileThumb;
