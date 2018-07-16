import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FileDrawerItem from "./file-drawer-item";

@inject("desktopStore")
@observer
class FileDrawer extends Component {
  constructor() {
    super();
    this.state = {
      shiftStatus: false
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleShiftStatus);
    document.addEventListener("keyup", this.handleShiftStatus);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleShiftStatus);
    document.removeEventListener("keyup", this.handleShiftStatus);
  }

  handleShiftStatus = e => {
    this.setState({ shiftStatus: e.shiftKey });
  };

  render() {
    const { desktopStore } = this.props;
    const { files, highlightId } = desktopStore;
    const { shiftStatus } = this.state;

    return (
      <div className="file-drawer-addon">
        {files.map(file => {
          return (
            <FileDrawerItem
              key={file.id}
              shiftStatus={shiftStatus}
              hasHighlight={file.id === highlightId}
              {...file}
            />
          );
        })}
      </div>
    );
  }
}

export default FileDrawer;
