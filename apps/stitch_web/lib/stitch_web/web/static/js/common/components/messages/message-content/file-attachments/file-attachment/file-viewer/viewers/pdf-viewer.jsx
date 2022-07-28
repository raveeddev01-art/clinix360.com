import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { LoadingIcon } from "common/components";
import { Document, Page } from "react-pdf/dist/entry.noworker";

@inject("teamFileStore")
class PdfViewer extends Component {
  constructor() {
    super();
    this.state = {
      numPages: 0,
      document: null
    };
  }

  componentWillMount() {
    this.loadDocument();
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  };

  loadDocument() {
    this.props.teamFileStore.fetchFile(this.props.url)
      .then(response => response.blob())
      .then((blob) => {
        this.setState({document: window.URL.createObjectURL(blob)});
      })
      .catch(err => console.error(err));
  }

  render() {
    const { url } = this.props;
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
        file={this.state.document}
        renderAnnotations={false}
        renderTextLayer={false}
        loading={<LoadingIcon size={3} />}
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
