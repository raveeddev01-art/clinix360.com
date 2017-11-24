import React, { Component } from "react";
import PropTypes from "prop-types";
import noop from "lodash/noop";
import Dropzone from "react-dropzone";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import cx from "classnames";
import Button from "react-bootstrap/lib/Button";

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

  onChangeCrop = (crop, pixelCrop) => {
    this.setState({ crop, pixelCrop });
  };

  onCancelCrop = () => this.setState({ isCropping: false });

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
    const { onError } = this.props;
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
    };

    reader.onerror = () => {
      this.setState({ isLoading: false });
      onError("There was problem loading the image");
    };

    reader.readAsDataURL(imageFile);
  };

  onCrop = () => {
    const { size, onCrop } = this.props;
    const { pixelCrop, imgDataURL } = this.state;
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

      onCrop(canvasURL);
      this.setState({
        croppedURL: canvasURL,
        isCropping: false,
        isLoading: false
      });
    };
    img.src = imgDataURL;

    this.setState({ isLoading: true });
  };

  renderDropzone() {
    const { url } = this.props;
    const { croppedURL } = this.state;
    return (
      <Dropzone
        className="avatar-uploader__dropzone"
        multiple={false}
        accept="image/*"
        onDrop={this.onImageDrop}
      >
        {!(url || croppedURL) && <p>Click here or drag an image here.</p>}
        {(url || croppedURL) && (
            <img
              alt="avatar"
              src={croppedURL || url}
              className="avatar-uploader__image"
            />
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
        <div className="avatar-uploader__cropper-actions">
          <Button bsSize="xsmall" onClick={this.onCrop}>
            Use Crop
          </Button>
          <Button bsSize="xsmall" onClick={this.onCancelCrop}>
            Cancel
          </Button>
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
        {disabled && (
          <div className="avatar-uploader__cloak">
            <i className="fa fa-circle-o-notch fa-spin fa-fw on-right" />
          </div>
        )}
        {isCropping ? this.renderCropper() : this.renderDropzone()}
      </div>
    );
  }
}

AvatarUploader.propTypes = {
  onCrop: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  onError: PropTypes.func.isRequired,
  url: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.number
};

AvatarUploader.defaultProps = {
  onCrop: noop,
  isUploading: false,
  onError: noop,
  url: "",
  className: "",
  size: 200
};

export default AvatarUploader;
