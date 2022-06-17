import React, { Component } from "react";
import PropTypes from "prop-types";

class DocxViewer extends Component {
  render() {
    const { preview_url, url } = this.props;
    const file = `${url}?authenticationToken=${window.authenticationToken}`;

    return (
      <div className="word-document-body">
        <iframe className="word-document" frameBorder="0" src={`https://docs.google.com/gview?url=${encodeURIComponent(file)}&embedded=true`}></iframe>
      </div>
    );
  }
}

DocxViewer.propTypes = {
  preview_url: PropTypes.string.isRequired
};

export default DocxViewer;
