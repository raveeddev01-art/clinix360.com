import React, { Component } from "react";
import PropTypes from "prop-types";

class ExcelViewer extends Component {

  render() {
    const { url } = this.props;
    const file_url = `${url}?authenticationToken=${window.authenticationToken}`;
    console.log("URL", file_url);
    this.loadFile();

    return (
      <div className="word-document-body">
        <iframe className="word-document" frameBorder="0" src={`https://docs.google.com/gview?url=${encodeURIComponent(file_url)}&embedded=true`}></iframe>
      </div>
    );
  }
}

ExcelViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ExcelViewer;
