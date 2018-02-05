import React, { Component } from "react";
import PropTypes from "prop-types";
import noop from "lodash/noop";
import Dropzone from "react-dropzone";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import cx from "classnames";
import Button from "react-bootstrap/lib/Button";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import SmartDropdown from "../smart-dropdown";

import { dataURItoBlob } from "lib/utils";
import { LoadingIcon } from "common/components";

class AvatarUploader extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      isCropping: false,
      isLoading: false,
      crop: {},
      pixelCrop: {},
      croppedURL: "",
      imgDataURL: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCropping !== this.props.isCropping) {
      this.setState({
        isCropping: nextProps.isCropping
      });
    }
  }

  onChangeCrop = (crop, pixelCrop) => {
    this.setState({ crop, pixelCrop });
  };

  onCancelCrop = () => {
    this.setState({ isCropping: false });
    this.props.onCropping(false);
  };

  onImageLoaded = image => {
    const constraint = {};
    if (image.width < image.height) {
      constraint.width = 100;
    } else {
      constraint.height = 100;
    }
    this.setState({
      crop: makeAspectCrop(
        {
          x: 0,
          y: 0,
          aspect: 1,
          ...constraint
        },
        image.width / image.height
      )
    });
  };

  onImageDrop = files => {
    const { onError, onCropping } = this.props;
    const reader = new FileReader();
    const imageFile = files[0];

    this.setState({ isLoading: true });
    reader.onloadend = () => {
      this.setState({
        isCropping: true,
        isLoading: false,
        imgDataURL: reader.result,
        croppedURL: ""
      });
      onCropping(true);
    };

    reader.onerror = () => {
      this.setState({ isLoading: false });
      onError("There was problem loading the image");
    };

    reader.readAsDataURL(imageFile);
  };

  onCrop = () => {
    const { size, onCrop, onError } = this.props;
    const { pixelCrop, imgDataURL, isCropping } = this.state;
    if (!isCropping) {
      onError("Please upload image first");
      return;
    }

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      const min = Math.min(img.width, img.height);
      ctx.drawImage(
        img,
        pixelCrop.x || 0,
        pixelCrop.y || 0,
        pixelCrop.width || min,
        pixelCrop.height || min,
        0,
        0,
        size,
        size
      );

      const canvasURL = canvas.toDataURL();

      onCrop(dataURItoBlob(canvasURL));
      this.setState({
        croppedURL: canvasURL,
        isCropping: false,
        isLoading: false
      });
    };
    img.src = imgDataURL;

    this.setState({ isLoading: true });
  };

  // stopping propagation on click cloak to prevent unwanted file dialog
  onCloakClick = evt => {
    evt.stopPropagation();
  };

  onOpenFileDialog = () => {
    if (this.dropzone) {
      this.dropzone.open();
    }
  };

  onDeletePhoto = () => {
    this.props.onDelete();
  };

  renderLoadingIcon = () => {
    const { isUploading } = this.props;

    return isUploading && <LoadingIcon className="on-right" />;
  };

  renderDropzone() {
    const { url, hasAvatar, isUploading, isCropped } = this.props;
    const { croppedURL } = this.state;
    return (
      <Dropzone
        className="avatar-uploader__dropzone"
        multiple={false}
        accept="image/*"
        onDrop={this.onImageDrop}
        ref={node => {
          this.dropzone = node;
        }}
      >
        <img
          alt="avatar"
          src={isCropped ? croppedURL : url}
          className="avatar-uploader__image"
        />
        {!isUploading && (
          <div className="avatar-uploader__cloak" onClick={this.onCloakClick}>
            <SmartDropdown id="user-mention" className="user-mention-dropdown">
              <Dropdown.Toggle
                useAnchor
                noCaret
                className="avatar-uploader__menu-anchor"
              >
                Change Profile Photo
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onClick={this.onOpenFileDialog}>
                  Upload Photo
                </MenuItem>

                {hasAvatar && (
                  <MenuItem onClick={this.onDeletePhoto}>Delete Photo</MenuItem>
                )}
              </Dropdown.Menu>
            </SmartDropdown>
          </div>
        )}
      </Dropzone>
    );
  }

  renderCropper() {
    const { crop, imgDataURL } = this.state;

    return (
      <div className="avatar-uploader__cropper">
        <div className="avatar-uploader__cropper-image">
          <ReactCrop
            keepSelection
            minWidth={20}
            minHeight={20}
            crop={crop}
            src={imgDataURL}
            onImageLoaded={this.onImageLoaded}
            onChange={this.onChangeCrop}
          />
        </div>
      </div>
    );
  }

  render() {
    const { isCropping, isLoading } = this.state;
    const { isUploading, className } = this.props;
    const disabled = isLoading || isUploading;

    return (
      <div className={cx("avatar-uploader", className)}>
        <div className="avatar-uploader__content">
          {disabled && (
            <div className="avatar-uploader__cloak">
              <LoadingIcon className="on-right" />
            </div>
          )}
          {isCropping ? this.renderCropper() : this.renderDropzone()}
        </div>
        {(isCropping || isUploading) && (
            <div className="avatar-uploader__actions">
              <Button
                className="btn-fancy"
                disabled={isUploading}
                onClick={this.onCancelCrop}
              >
                Cancel
              </Button>
              <Button
                bsStyle="primary"
                className="btn-fancy"
                onClick={this.onCrop}
                disabled={isUploading}
              >
                Save Profile Image
              </Button>
            </div>
          )}
      </div>
    );
  }
}

AvatarUploader.propTypes = {
  onCrop: PropTypes.func.isRequired,
  onCropping: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  isCropped: PropTypes.bool.isRequired,
  isCropping: PropTypes.bool.isRequired,
  hasAvatar: PropTypes.bool.isRequired,
  onError: PropTypes.func.isRequired,
  url: PropTypes.any,
  className: PropTypes.string,
  size: PropTypes.number
};

AvatarUploader.defaultProps = {
  onCrop: noop,
  onCropping: noop,
  onDelete: noop,
  isUploading: false,
  isCropped: false,
  isCropping: false,
  hasAvatar: false,
  onError: noop,
  url: "",
  className: "",
  size: 200
};

export default AvatarUploader;
