import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import UploadProgressBar from "./upload-progress-bar";

@inject("uploadStore")
@observer
class UploadProgress extends Component {
  renderProgressBar = (key, progress) => {
    const { uploadStore } = this.props;
    if (typeof progress === "number") {
      const filename = uploadStore.fileNames.get(key);
      return (
        <UploadProgressBar
          key={key}
          progress={progress}
          filename={filename}
          label={`Uploading ${filename}... ${progress.toFixed(0)}%`}
          cancel={() => uploadStore.abortUpload(key)}
        />
      );
    }

    return (
      <UploadProgressBar
        key={key}
        progress={100}
        showCancel={false}
        label={`Processing uploaded file...`}
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
