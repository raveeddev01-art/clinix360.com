import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("mentionsStore")
@observer
class Mentions extends Component {
  loadMore = () => {
    const { mentionsStore } = this.props;
    mentionsStore.loadMore();
  };

  renderMentionsResults() {
    const { mentionsStore } = this.props;

    if (mentionsStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (mentionsStore.mentions.length > 0) {
      return (
        <div>
          {mentionsStore.mentions.map(mention => (
            <AddonMessage key={mention.id} message={mention} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-muted text-center">No mentions of you found.</div>
    );
  }

  render() {
    const { mentionsStore } = this.props;

    return (
      <div className="search-results-addon">
        {this.renderMentionsResults()}

        <div className="footer">
          {mentionsStore.hasMore &&
            !mentionsStore.loading && (
              <button
                className="btn btn-default btn-sm"
                disabled={mentionsStore.loading}
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

export default Mentions;
