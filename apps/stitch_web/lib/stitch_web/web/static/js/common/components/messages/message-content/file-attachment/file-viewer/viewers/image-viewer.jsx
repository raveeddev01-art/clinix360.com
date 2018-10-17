import React, { Component } from "react";
import PropTypes from "prop-types";

class ImageViewer extends Component {
  render() {
    const { url } = this.props;

    return <img src={url} className="img-responsive" alt="file-viewer" />;
  }
}

ImageViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ImageViewer;
