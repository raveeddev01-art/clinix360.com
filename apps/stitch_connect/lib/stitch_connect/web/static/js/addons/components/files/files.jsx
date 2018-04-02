import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("filesStore")
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
    const { filesStore } = this.props;

    if (filesStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (filesStore.files.length > 0) {
      return (
        <div>
          {filesStore.files.map(file => (
            <AddonMessage key={file.id} message={file} />
          ))}
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

export default Files;
