import React, { Component } from "react";
import PropTypes from "prop-types";
import { Document, Page } from "react-pdf/dist/entry.noworker";
import DefaultFileAttachment from "./default";
import FileViewer from "./file-viewer";

class PdfFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onToggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  render() {
    const { showModal } = this.state;
    const { url, onCommentsClick } = this.props;
    const file = `${url}?authenticationToken=${window.authenticationToken}`;

    return (
      <DefaultFileAttachment {...this.props}>
        <div className="pdf-thumb" onClick={this.onToggleModal}>
          <Document
            file={file}
            renderAnnotations={false}
            renderTextLayer={false}
          >
            <Page pageNumber={1} width={onCommentsClick ? 380 : 290} />
          </Document>
        </div>
        <FileViewer
          {...this.props}
          type="PDF Document"
          show={showModal}
          onHideModal={this.onToggleModal}
        />
      </DefaultFileAttachment>
    );
  }
}

PdfFileAttachment.propTypes = {
  url: PropTypes.string,
  onCommentsClick: PropTypes.func
};

PdfFileAttachment.defaultProps = {
  url: "",
  onCommentsClick: undefined
};

export default PdfFileAttachment;
