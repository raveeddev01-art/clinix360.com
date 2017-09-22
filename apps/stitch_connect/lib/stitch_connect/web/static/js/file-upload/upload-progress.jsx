import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import UploadProgressBar from "./upload-progress-bar";

@inject("uploadStore")
@observer
class UploadProgress extends Component {
  renderProgressBar = (key, progress) => {
    if (typeof progress === "number") {
      return (
        <UploadProgressBar
          key={key}
          progress={progress}
          filename={key}
          label={`${key}: ${progress.toFixed(0)}%`}
          cancel={() => {}}
        />
      );
    }

    return (
      <UploadProgressBar
        key={key}
        progress={100}
        showCancel={false}
        label={`Processing ${key}...`}
      />
    );
  };

  render() {
    const uploadProgress = this.props.uploadStore.uploadProgress;

    return (
      <div className="progress-bars">
        {uploadProgress
          .keys()
          .map(key => this.renderProgressBar(key, uploadProgress.get(key)))}
      </div>
    );
  }
}

export default UploadProgress;
