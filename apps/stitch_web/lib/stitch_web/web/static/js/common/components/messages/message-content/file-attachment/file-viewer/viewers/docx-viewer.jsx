import React, { Component } from "react";
import PropTypes from "prop-types";

class DocxViewer extends Component {
  render() {
    const { url } = this.props;
    console.log(this.props);
    return (
      <div className="file-viewer__body-img">
        <iframe frameBorder="0" src={`https://docs.google.com/gview?url=${url}&embedded=true`}></iframe>
      </div>
    );
  }
}

DocxViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default DocxViewer;
