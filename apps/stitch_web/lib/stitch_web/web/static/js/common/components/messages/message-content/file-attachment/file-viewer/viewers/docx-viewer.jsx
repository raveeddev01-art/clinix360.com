import React, { Component } from "react";
import PropTypes from "prop-types";

class DocxViewer extends Component {
  render() {
    const { preview_url } = this.props;

    return (
      <div className="word__Document">
        <iframe className="word__Document" frameBorder="0" src={`https://docs.google.com/gview?url=${encodeURIComponent(preview_url)}&embedded=true`}></iframe>
      </div>
    );
  }
}

DocxViewer.propTypes = {
  preview_url: PropTypes.string.isRequired
};

export default DocxViewer;
