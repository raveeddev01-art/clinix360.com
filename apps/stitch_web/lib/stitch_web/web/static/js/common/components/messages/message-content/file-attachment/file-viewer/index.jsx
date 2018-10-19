import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import { Avatar } from "common/components";
import get from "lodash/get";
import moment from "moment";
import AttachmentActions from "../components/attachment-actions";
import Viewers from "./viewers";

@inject("usersStore")
@observer
class FileViewer extends Component {
  render() {
    const {
      filename,
      url,
      comment_count: commentCount,
      onFileDownload,
      file_id,
      encoded_id,
      user_id,
      public_url,
      show,
      onHideModal,
      type
    } = this.props;
    const Viewer = Viewers[type];
    const user = this.props.usersStore.getUserById(user_id);
    let date = get(this.props, "message.inserted_at");

    if (date) {
      date = moment
        .utc(date)
        .local()
        .format("MMM Do [at] h:mm A");
    }

    return (
      <Modal show={show} dialogClassName="file-viewer" onHide={onHideModal}>
        <Modal.Body>
          <div className="file-viewer__header">
            <div className="file-viewer__header-left">
              <Avatar user={user} />
              <div className="file-viewer__header-content">
                <div className="file-viewer__header-title">{filename}</div>
                <div className="file-viewer__header-info">
                  <span className="file-viewer__header-username">
                    {user.full_name}
                  </span>
                  &nbsp;&nbsp;
                  <span className="file-viewer__header-date">{date}</span>
                </div>
              </div>
            </div>
            <div className="file-viewer__header-right">
              <AttachmentActions
                url={url}
                file_id={file_id}
                user_id={user_id}
                encoded_id={encoded_id}
                public_url={public_url}
                commentCount={commentCount}
                onFileDownload={onFileDownload}
                tooltipPlacement="bottom"
              />
              <div className="file-viewer__header-separator" />
              <i
                className="file-viewer__header-close fa fa-close"
                onClick={onHideModal}
              />
            </div>
          </div>
          <div className="file-viewer__body">
            <Viewer url={url} />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

FileViewer.propTypes = {
  type: PropTypes.oneOf(["Image", "PDF Document"]),
  show: PropTypes.bool.isRequired,
  onHideModal: PropTypes.func.isRequired,
  filename: PropTypes.string,
  url: PropTypes.string.isRequired,
  comment_count: PropTypes.number,
  onFileDownload: PropTypes.func.isRequired,
  file_id: PropTypes.number.isRequired,
  encoded_id: PropTypes.string,
  public_url: PropTypes.string,
  user_id: PropTypes.number.isRequired
};

FileViewer.defaultProps = {
  type: "Image",
  public_url: "",
  filename: "",
  encoded_id: "",
  comment_count: 0
};

export default FileViewer;
