import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("filesStore", "groupStore")
@observer
class Files extends Component {
  componentWillMount() {
    const { filesStore } = this.props;

    if (filesStore.isEmpty) {
      filesStore.loadMore();
    }
  }

  loadMore = () => {
    const { filesStore } = this.props;

    filesStore.loadMore();
  };

  renderFilesResults() {
    const { filesStore, groupStore, roomFiles } = this.props;

    const filteredFiles = filesStore.files.filter(
      file => file.group_id === groupStore.group.id
    );
    const allFiles = filesStore.files;
    const files = roomFiles ? filteredFiles : allFiles;

    if (filesStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (files.length > 0) {
      return (
        <div>
          {files.map(file => <AddonMessage key={file.id} message={file} />)}
        </div>
      );
    }

    return <div className="text-muted text-center">Nothing uploaded yet.</div>;
  }

  render() {
    const { filesStore } = this.props;

    return (
      <div className="files-addon">
        {this.renderFilesResults()}

        <div className="footer">
          {filesStore.hasMore &&
            !filesStore.loading && (
              <button
                className="btn btn-default btn-sm"
                disabled={filesStore.loading}
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
