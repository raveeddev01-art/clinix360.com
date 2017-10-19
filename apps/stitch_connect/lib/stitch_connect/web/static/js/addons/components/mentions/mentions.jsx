import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../../../common/components/messages/addon-message";

@inject("mentionsStore")
@observer
class Mentions extends Component {
  componentWillMount() {
    const { mentionsStore } = this.props;

    if (mentionsStore.isEmpty) {
      mentionsStore.loadMore();
    }
  }

  loadMore = () => {
    const { mentionsStore } = this.props;

    mentionsStore.loadMore();
  };

  render() {
    const { mentionsStore } = this.props;

    return (
      <div className="message-search-addon">
        {mentionsStore.mentions.length > 0 ? (
          <div>
            {mentionsStore.mentions.map(mention => (
              <AddonMessage key={mention.id} message={mention} />
            ))}
          </div>
        ) : (
          <div className="text-muted text-center">
            No mentions of you found.
          </div>
        )}

        <div className="footer">
          {mentionsStore.hasMore && (
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
