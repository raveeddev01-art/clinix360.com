import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import File from "./file";

@inject("filesStore")
@observer
class Files extends Component {
  componentWillMount() {
    const { filesStore } = this.props;

    if (filesStore.isEmpty) {
      filesStore.loadMore();
    }
  }

  render() {
    const { filesStore } = this.props;

    return (
      <div className="files-addon addon-messages">
        {filesStore.files.map(file => <File key={file.id} file={file} />)}
      </div>
    );
  }
}

export default Files;
