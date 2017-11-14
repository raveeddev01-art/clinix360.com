import React, { Component } from "react";
import PropTypes from "prop-types";
import ImageFileAttachment from "./file-attachment/image";

class LinkPreview extends Component {
  render() {
    const {
      description,
      title,
      image_url: imageUrl,
      favicon_url: favicon,
      link
    } = this.props;

    return (
      <div className="link-preview">
        {favicon && (
          <span className="link-preview__site">
            <img className="link-preview__favicon" src={favicon} alt={title} />
            <span>{link.replace(/https?:\/\//g, "")}</span>
          </span>
        )}
        <a
          href={link}
          className="link-preview__title"
          rel="noopener noreferrer"
          target="_blank"
        >
          {title}
        </a>
        {description && (
          <span className="link-preview__description">{description}</span>
        )}
        {imageUrl && <ImageFileAttachment url={imageUrl} />}
      </div>
    );
  }
}

LinkPreview.propTypes = {
  description: PropTypes.string,
  image_url: PropTypes.string,
  link: PropTypes.string,
  title: PropTypes.string,
  favicon_url: PropTypes.string
};

LinkPreview.defaultProps = {
  description: "",
  image_url: "",
  link: "",
  title: "",
  favicon_url: ""
};

export default LinkPreview;
