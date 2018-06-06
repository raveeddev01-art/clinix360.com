import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

class UploadProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canceling: false
    };
  }

  onCancel = () => {
    const { cancel } = this.props;
    cancel();
    this.setState({
      canceling: true
    });
  };

  render() {
    const { label, progress, showCancel, filename } = this.props;
    const { canceling } = this.state;
    const progressCN = cx("progress", {
      canceled: canceling
    });

    return (
      <div className="progress-bar-wrapper">
        <div className={progressCN}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-bar-label">
          {canceling ? `Canceling ${filename}...` : label}
        </span>
        {showCancel &&
          !canceling && (
            <a className="progress-cancel" role="link" onClick={this.onCancel}>
              Cancel
            </a>
          )}
      </div>
    );
  }
}

UploadProgress.propTypes = {
  label: PropTypes.string,
  filename: PropTypes.string,
  progress: PropTypes.number.isRequired,
  showCancel: PropTypes.bool.isRequired,
  cancel: PropTypes.func
};

UploadProgress.defaultProps = {
  showCancel: true,
  filename: "",
  cancel: () => {},
  label: "",
  progress: 0
};

export default UploadProgress;
