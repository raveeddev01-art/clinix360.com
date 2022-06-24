import React, { Component } from "react";
import PropTypes from "prop-types";

class VideoViewer extends Component {
  render() {
    const { url } = this.props;
    return (
      <div className="file-viewer__body-img">
        <video
            controls
            src={url} />
      </div>
    );
  }
}

VideoViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default VideoViewer;
