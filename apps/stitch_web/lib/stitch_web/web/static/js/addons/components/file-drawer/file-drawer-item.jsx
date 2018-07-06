import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import cx from "classnames";
import FileThumb from "common/components/file-item/file-thumb";

@inject("desktopStore")
class FileDrawerItem extends Component {
  openFile = () => {
    const { shiftStatus, id, desktopStore } = this.props;

    if (shiftStatus) {
      desktopStore.send("openFile", { fileId: id });
    } else {
      desktopStore.send("openDownloadLocation", { fileId: id });
    }
  };

  cancel = e => {
    const { status, desktopStore, id } = this.props;
    e.stopPropagation();

    if (status !== "progress") {
      desktopStore.send("removeFile", { fileId: id });
    }
  };

  renderProgress() {
    const { progress } = this.props;

    return (
      <div className="progress-bar-wrapper">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  render() {
    const {
      mimetype,
      filename,
      shiftStatus,
      status,
      previewUrl,
      hasHighlight
    } = this.props;
    const actionIconCN = cx("fa", "file-drawer-item__icon-action", {
      "fa-search": !shiftStatus,
      "fa-external-link": shiftStatus,
      hidden: status && status === "progress"
    });
    const action = shiftStatus
      ? "Click to Open"
      : `Show In ${window.electronOS === "darwin" ? "Finder" : "Explorer"}`;
    const itemCN = cx("file-drawer-item", {
      "file-drawer-item--highlight": hasHighlight
    });

    return (
      <div className={itemCN} onClick={this.openFile}>
        <div className="file-drawer-item__icon">
          <FileThumb mimetype={mimetype} previewUrl={previewUrl} />
          <i className={actionIconCN} />
        </div>
        <div className="file-drawer-item__content">
          <div className="file-drawer-item__filename">{filename}</div>
          {status === "progress" ? (
            this.renderProgress()
          ) : (
            <div className="file-drawer-item__action">{action}</div>
          )}
        </div>
        <i
          className="file-drawer-item__delete fa fa-times-circle-o"
          onClick={this.cancel}
        />
      </div>
    );
  }
}

FileDrawerItem.propTypes = {
  id: PropTypes.number.isRequired,
  mimetype: PropTypes.string.isRequired,
  previewUrl: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  shiftStatus: PropTypes.bool.isRequired,
  status: PropTypes.string,
  progress: PropTypes.number,
  hasHighlight: PropTypes.bool.isRequired
};

FileDrawerItem.defaultProps = {
  mimetype: "",
  filename: "",
  previewUrl: "",
  status: "finished",
  progress: 0,
  shiftStatus: false
};

export default FileDrawerItem;
