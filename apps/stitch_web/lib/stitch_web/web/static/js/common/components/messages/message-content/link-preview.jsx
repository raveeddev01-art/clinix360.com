import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import { isAdmin } from "lib/utils";
import { confirmModal } from "../../../modals";

@inject("messageStore")
class LinkPreview extends Component {
  constructor() {
    super();
    this.state = {
      imageLoadError: false
    };
  }

  onClose = () => {
    confirmModal({
      title: "Delete Preview",
      message: "Are you sure you want to remove the link preview?",
      okLable: "Delete"
    }).then(() => {
      const { link, messageId, messageStore } = this.props;
      messageStore.deleteLinkPreview(messageId, link);
    });
  };

  onImageLoadError = () => {
    this.setState({ imageLoadError: true });
  };

  render() {
    const {
      description,
      title,
      image_url: imageUrl,
      favicon_url: favicon,
      link,
      senderId,
      site_name: siteName
    } = this.props;
    const { imageLoadError } = this.state;

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

        <div className="link-preview__line" />

        <div className="link-preview__body">
          <div className="link-preview__text">
            {favicon && (
              <div className="link-preview__site">
                <img
                  className="link-preview__favicon"
                  src={favicon}
                  alt={title}
                />
                <span>{siteName || title}</span>
              </div>
            )}
            <a
              href={link}
              className="link-preview__title"
              rel="noopener noreferrer"
              target="_blank"
            >
              {title}
            </a>
            <div className="link-preview__description">{description}</div>
          </div>
          {imageUrl &&
            !imageLoadError && (
              <div className="link-preview__image-container">
                <img
                  src={imageUrl}
                  className="link-preview__image"
                  alt={title}
                  onError={this.onImageLoadError}
                />
              </div>
            )}
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
  site_name: PropTypes.string,
  senderId: PropTypes.number.isRequired,
  messageId: PropTypes.number.isRequired
};

LinkPreview.defaultProps = {
  description: "",
  image_url: "",
  link: "",
  title: "",
  favicon_url: "",
  site_name: ""
};

export default LinkPreview;
