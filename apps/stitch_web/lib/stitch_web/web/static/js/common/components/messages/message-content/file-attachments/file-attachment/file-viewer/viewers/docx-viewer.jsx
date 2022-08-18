import React, { Component } from "react";
import PropTypes from "prop-types";

class DocxViewer extends Component {
  render() {
    const { url } = this.props;
    const file_url = `${url}?authenticationToken=${window.authenticationToken}`;

    return (
      <div className="word-document-body">
        <iframe className="word-document" frameBorder="0" src={`https://docs.google.com/gview?url=${encodeURIComponent(file_url)}&embedded=true`}></iframe>
      </div>
    );
  }
}

DocxViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default DocxViewer;
