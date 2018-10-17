import React, { Component } from "react";
import PropTypes from "prop-types";
import { Document, Page } from "react-pdf/dist/entry.noworker";

class PdfViewer extends Component {
  constructor() {
    super();
    this.state = {
      numPages: 0
    };
  }
  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  };

  render() {
    const { url } = this.props;
    const file = `${url}?authenticationToken=${window.authenticationToken}`;
    const pages = [];

    for (let i = 0; i < this.state.numPages; i += 1) {
      pages.push(
        <Page
          pageNumber={i + 1}
          key={`page_${i}`}
          renderAnnotations={false}
          renderTextLayer={false}
        />
      );
    }

    return (
      <Document
        file={file}
        renderAnnotations={false}
        renderTextLayer={false}
        onLoadSuccess={this.onDocumentLoad}
      >
        {pages}
      </Document>
    );
  }
}

PdfViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default PdfViewer;
