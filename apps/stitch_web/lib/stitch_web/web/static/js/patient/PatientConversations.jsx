import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router";

import InboxMenu from "../engage/inbox/inbox";
import ConversationPanel from "../engage/conversation/conversation_panel";
import LoadingPanel from "../engage/LoadingPanel";

@inject("inboxStore")
@observer
class PatientConversations extends Component {
  componentWillMount() {
    this.openConversation(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.openConversation(nextProps.match.params.id);
    }
  }

  openConversation() {
    // const { inboxStore } = this.props;
    // inboxStore.openConversation(params);
  }

  render() {
    const { inboxStore } = this.props;
    const loaded = inboxStore.messagesLoaded;

    return (
      <div className="engage-wrapper">
        <InboxMenu />
        <div id="main">
          <div className="flex-content">
            {loaded ? <ConversationPanel /> : <LoadingPanel />}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PatientConversations);
