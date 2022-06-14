import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Dropzone from "react-dropzone";
import UploadModal from "./upload-modal";

@inject("uploadStore")
@observer
class UploadZone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      dropzoneActive: false
    };
  }

  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    });
  };

  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    });
  };

  onDrop = files => {
    const { uploadStore, isEngage } = this.props;

    if (files.length) {
      uploadStore.openUploadModal(
        files,
        undefined,
        isEngage ? "engage" : "connect"
      );
    }

    this.setState({
      dropzoneActive: false
    });
  };

  setDropzoneRef = ref => {
    const { uploadStore } = this.props;

    uploadStore.dropzoneRef = ref;
  };

  render() {
    const { children } = this.props;

    return (
      <Dropzone
        id="app"
        disableClick
        style={{}}
        onDrop={this.onDrop}
        ref={this.setDropzoneRef}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
      >
        {this.state.dropzoneActive && (
          <div className="dropzone-overlay">
            <div>Drop to Upload File</div>
          </div>
        )}
        <UploadModal />
        {children}
      </Dropzone>
    );
  }
}

UploadZone.propTypes = {
  children: PropTypes.node,
  isEngage: PropTypes.bool.isRequired
};

UploadZone.defaultProps = {
  children: null,
  isEngage: false
};

export default UploadZone;
