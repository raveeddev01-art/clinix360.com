import React, { Component } from "react";
import PropTypes from "prop-types";

class DocxViewer extends Component {
  render() {
    const { public_url } = this.props;

    return (
      <div className="file-viewer__body-img">
        <iframe frameBorder="0" src={`https://docs.google.com/gview?url=${public_url}&embedded=true`}></iframe>
      </div>
    );
  }
}

DocxViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default DocxViewer;
