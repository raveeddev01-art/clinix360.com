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
    this.props.inboxStore.loadEngage();
    if (this.props.match.params.id) {
      this.openConversation(this.props.match.params.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.openConversation(nextProps.match.params.id);
    }
  }

  openConversation(id) {
    const { inboxStore } = this.props;
    inboxStore.loadConversation(id);
  }

  render() {
    const { inboxStore } = this.props;
    const loaded = inboxStore.conversationsLoaded;

    return (
      <div className="engage-wrapper">
        <InboxMenu asPatient loaded={loaded} />
        <div id="main">
          <div className="flex-content">
            {loaded ? <ConversationPanel asPatient /> : <LoadingPanel />}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PatientConversations);
