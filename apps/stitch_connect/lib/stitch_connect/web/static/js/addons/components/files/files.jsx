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

  loadMore = event => {
    const { filesStore } = this.props;

    filesStore.loadMore();
  };

  render() {
    const { filesStore } = this.props;

    return (
      <div className="files-addon">
        <div className="addon-messages">
          {filesStore.files.map(file => <File key={file.id} file={file} />)}
        </div>

        <div className="footer">
          {filesStore.hasMore &&
            <button
              className="btn btn-default btn-sm"
              disabled={filesStore.loading}
              onClick={this.loadMore}
            >
              Load more…
            </button>}
        </div>
      </div>
    );
  }
}

export default Files;
