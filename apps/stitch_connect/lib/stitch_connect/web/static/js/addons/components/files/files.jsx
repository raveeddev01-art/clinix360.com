import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../../../common/components/messages/addon-message";

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
        {filesStore.files.length > 0 ? (
          <div>
            {filesStore.files.map(file => (
              <AddonMessage key={file.id} message={file} />
            ))}
          </div>
        ) : (
          <div className="text-muted text-center">Nothing uploaded yet.</div>
        )}

        <div className="footer">
          {filesStore.hasMore && (
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
