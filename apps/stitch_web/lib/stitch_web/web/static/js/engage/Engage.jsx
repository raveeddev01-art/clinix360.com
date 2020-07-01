import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import InboxMenu from "./inbox/inbox";
import ConversationPanel from "./conversation/conversation_panel";
import LoadingPanel from "./LoadingPanel";

@inject("teamStore", "inboxStore")
@observer
class Engage extends Component {
  componentWillMount() {
    this.loadConversation(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.loadConversation(nextProps.match.params.id);
    }
  }

  loadConversation(id) {
    const { inboxStore } = this.props;
    inboxStore.loadConversation(id);
  }

  render() {
    const { teamStore, inboxStore } = this.props;

    return (
      <div className="engage-wrapper">
        <Helmet>
          <title>{`${teamStore.name} | Clinix360 Engage`}</title>
        </Helmet>

        {inboxStore.messagesLoaded && <InboxMenu />}

        <div id="main">
          <div className="flex-content">
            {inboxStore.messagesLoaded ? (
              <ConversationPanel />
            ) : (
              <LoadingPanel />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Engage);
