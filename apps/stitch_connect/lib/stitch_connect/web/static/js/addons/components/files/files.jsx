import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("filesStore", "globalFilesStore")
@observer
class Files extends Component {
  loadMore = () => {
    const { filesStore, globalFilesStore, roomFiles } = this.props;
    const files = roomFiles ? filesStore : globalFilesStore;

    files.loadMore();
  };

  renderFilesResults() {
    const { filesStore, globalFilesStore, roomFiles } = this.props;
    const files = roomFiles ? filesStore : globalFilesStore;

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
    const { filesStore, globalFilesStore, roomFiles } = this.props;
    const files = roomFiles ? filesStore : globalFilesStore;

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
