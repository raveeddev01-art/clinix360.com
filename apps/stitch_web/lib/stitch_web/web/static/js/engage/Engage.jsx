import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import InboxMenu from "./inbox/inbox";
import ConversationPanel from "./conversation/conversation_panel";

@inject("teamStore", "inboxStore")
@observer
class Engage extends Component {
  componentWillMount() {
    this.openConversation(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.openConversation(nextProps.match.params.id);
    }
  }

  openConversation(params) {
    const { inboxStore } = this.props;
    inboxStore.openConversation(params);
  }

  render() {
    const { teamStore, inboxStore } = this.props;

    return (
      <div className="engage-wrapper">
        <Helmet>
          <title>{`${teamStore.name} | Stitch Engage`}</title>
        </Helmet>

        <InboxMenu />

        <div id="main">
          <div className="flex-content">
            {inboxStore.messagesLoaded ? (
              <ConversationPanel />
            ) : (
              <h2>NOOOOOOOOOT LOADED YET</h2>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Engage);
