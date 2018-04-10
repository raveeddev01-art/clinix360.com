import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("filesStore", "globalFilesStore")
@observer
class Files extends Component {
  loadMore = () => {
    const files = this.activeFileStore();
    files.loadMore();
  };

  activeFileStore = () => {
    const { filesStore, globalFilesStore, roomFiles } = this.props;
    return roomFiles ? filesStore : globalFilesStore;
  };

  renderFilesResults() {
    const files = this.activeFileStore();

    if (files.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (files.files.length > 0) {
      return (
        <div>
          {files.files.map(file => (
            <AddonMessage key={file.id} message={file} />
          ))}
        </div>
      );
    }

    return <div className="text-muted empty-files">Upload the first file!</div>;
  }

  render() {
    const files = this.activeFileStore();

    return (
      <div className="files-addon">
        {this.renderFilesResults()}

        <div className="footer">
          {files.hasMore &&
            !files.loading && (
              <button
                className="btn btn-default btn-sm"
                disabled={files.loading}
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
