import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("filesStore", "globalFilesStore")
@observer
class Files extends Component {
  loadMore = () => {
    const fileStore = this.activeFileStore();
    fileStore.loadMore();
  };

  activeFileStore = () => {
    const { filesStore, globalFilesStore, roomFiles } = this.props;
    return roomFiles ? filesStore : globalFilesStore;
  };

  renderFilesResults() {
    const fileStore = this.activeFileStore();

    if (fileStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (fileStore.files.length > 0) {
      return (
        <div>
          {fileStore.files.map(file => (
            <AddonMessage key={file.id} message={file} />
          ))}
        </div>
      );
    }

    return <div className="text-muted empty-files">Upload the first file!</div>;
  }

  render() {
    const fileStore = this.activeFileStore();

    return (
      <div className="files-addon">
        {this.renderFilesResults()}

        <div className="footer">
          {fileStore.hasMore &&
            !fileStore.loading && (
              <button
                className="btn btn-default btn-sm"
                disabled={fileStore.loading}
                onClick={this.loadMore}
              >
                Load more…
              </button>
            )}
        </div>
      </div>
    );
  }
}

Files.defaultProps = {
  roomFiles: false
};

Files.propTypes = {
  roomFiles: PropTypes.bool
};

export default Files;
