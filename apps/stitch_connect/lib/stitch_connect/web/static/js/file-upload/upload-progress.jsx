import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import ProgressBar from "react-bootstrap/lib/ProgressBar";

@inject("uploadStore")
@observer
export default class UploadProgress extends Component {
  renderProgressBar = (key, progress) => {
    if (typeof progress === "number") {
      return (
        <ProgressBar active key={key} now={progress} label={`${progress}%`} />
      );
    }

    return (
      <ProgressBar active key={key} now={100} label="Processing file..." />
    );
  };
  render() {
    const { uploadStore: { uploadProgress } } = this.props;
    return (
      <div className="progress-bars">
        {Object.keys(uploadProgress).map(key =>
          this.renderProgressBar(key, uploadProgress[key])
        )}
      </div>
    );
  }
}
