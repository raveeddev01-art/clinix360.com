import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import ImageFileAttachment from "./file-attachment/image";
import { isAdmin } from "../../../../lib/utils";
import { confirm } from "../../../modals";

@inject("messageStore")
@observer
class LinkPreview extends Component {
  onClose = () => {
    confirm({
      title: "Delete Preview",
      message: "Are you sure you want to remove the link preview?",
      okLable: "Delete"
    }).then(() => {
      const { link, messageId, messageStore } = this.props;
      messageStore.deleteLinkPreview(messageId, link);
    });
  };

  render() {
    const {
      description,
      title,
      image_url: imageUrl,
      favicon_url: favicon,
      link,
      senderId
    } = this.props;

    return (
      <div className="link-preview">
        {(isAdmin() || currentUser.id === senderId) && (
            <a
              role="link"
              onClick={this.onClose}
              className="link-preview__close"
            >
              <i className="fa fa-times" onClick={this.close} />
            </a>
          )}

        <div className="preview-line" />

        <div className="preview-body">
          {favicon && (
            <div className="link-preview__site">
              <img
                className="link-preview__favicon"
                src={favicon}
                alt={title}
              />
              <span>{link.replace(/https?:\/\//g, "")}</span>
            </div>
          )}
          <a
            href={link}
            className="link-preview__title"
            rel="noopener noreferrer"
            target="_blank"
          >
            <strong>{title}</strong>
          </a>
          {description && (
            <div className="link-preview__description">{description}</div>
          )}
          {imageUrl && <ImageFileAttachment url={imageUrl} />}
        </div>
      </div>
    );
  }
}

LinkPreview.propTypes = {
  description: PropTypes.string,
  image_url: PropTypes.string,
  link: PropTypes.string,
  title: PropTypes.string,
  favicon_url: PropTypes.string,
  senderId: PropTypes.number.isRequired,
  messageId: PropTypes.number.isRequired
};

LinkPreview.defaultProps = {
  description: "",
  image_url: "",
  link: "",
  title: "",
  favicon_url: ""
};

export default LinkPreview;
