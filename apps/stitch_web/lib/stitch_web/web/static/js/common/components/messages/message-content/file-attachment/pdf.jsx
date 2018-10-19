import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { FILE_VIEW_SIZE_LIMIT } from "lib/constants";
import { getFullUrl } from "lib/utils";
import DefaultFileAttachment from "./default";
import FileViewer from "./file-viewer";

// @TODO implement pdf thumb as image
class PdfFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onToggleModal = () => {
    const { encoded_id, useActions } = this.props;
    if (this.isAllowedForPreview()) {
      this.setState({ showModal: !this.state.showModal });
    } else if (useActions) {
      const detailPageUrl =
        encoded_id && getFullUrl(`/admin/files/${encoded_id}`);
      window.open(detailPageUrl);
    }
  };

  isAllowedForPreview = () => {
    return this.props.size_in_bytes < FILE_VIEW_SIZE_LIMIT.PDF;
  };

  render() {
    const { showModal } = this.state;
    const { preview_url: previewUrl, useActions } = this.props;
    const thumbCN = cx("pdf-thumb", {
      "pdf-thumb--zoom": this.isAllowedForPreview(),
      "pdf-thumb--original": !this.isAllowedForPreview() && useActions
    });
    return (
      <DefaultFileAttachment {...this.props}>
        <div className={thumbCN} onClick={this.onToggleModal}>
          <img src={previewUrl} className="img-responsive" alt="pdf-thumb" />
        </div>

        {this.isAllowedForPreview() && (
          <FileViewer
            {...this.props}
            type="PDF Document"
            show={showModal}
            onHideModal={this.onToggleModal}
          />
        )}
      </DefaultFileAttachment>
    );
  }
}

PdfFileAttachment.propTypes = {
  size_in_bytes: PropTypes.number.isRequired,
  useActions: PropTypes.bool,
  encoded_id: PropTypes.string,
  preview_url: PropTypes.string
};

PdfFileAttachment.defaultProps = {
  useActions: true,
  encoded_id: "",
  preview_url: ""
};

export default PdfFileAttachment;
