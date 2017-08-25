import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import ProgressBar from "react-bootstrap/lib/ProgressBar";

@inject("uploadStore")
@observer
class UploadProgress extends Component {
  renderProgressBar = (key, progress) => {
    if (typeof progress === "number") {
      return (
        <ProgressBar
          key={key}
          now={progress}
          label={`${progress.toFixed(0)}%`}
        />
      );
    }

    return <ProgressBar key={key} now={100} label="Processing file..." />;
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
