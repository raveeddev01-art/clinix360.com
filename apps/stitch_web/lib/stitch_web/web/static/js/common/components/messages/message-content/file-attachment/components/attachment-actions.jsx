import React, { Component } from "react";
import PropTypes from "prop-types";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";

class AttachmentActions extends Component {
  render() {
    const { url, onCommentsClick, commentCount, onFileDownload } = this.props;

    return (
      <div className="attachment-actions">
        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="file-comments">File comments</Tooltip>}
        >
          <Button href={url} onClick={onCommentsClick}>
            {commentCount
              ? commentCount > 1
                ? `${commentCount} comments`
                : `${commentCount} comment`
              : `Add Comment`}
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="download-file">Download</Tooltip>}
        >
          <Button target="_blank" href={url} onClick={onFileDownload}>
            <i className="fa fa-download" />
          </Button>
        </OverlayTrigger>
      </div>
    );
  }
}

AttachmentActions.propTypes = {
  url: PropTypes.string.isRequired,
  commentCount: PropTypes.number,
  onCommentsClick: PropTypes.func,
  onFileDownload: PropTypes.func.isRequired
};

AttachmentActions.defaultProps = {
  commentCount: 0,
  onCommentsClick: () => undefined
};

export default AttachmentActions;
