import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import getMessageText from "../../../common/get-message-text/get-message-text";
import MessageHead from "../../../common/components/message-head/message-head";

@inject("sidemenuStore")
@observer
class SearchResultItem extends Component {
  render() {
    const { sidemenuStore } = this.props;

    return (
      <div className="message-pool-container search-result-item">
        <div className="message-search-result-actions">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="open-a-direct-message">Jump</Tooltip>}
          >
            <a
              role="link"
              className="message-search-result-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-hand-o-left" />
            </a>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="open-a-direct-message">Permalink</Tooltip>}
          >
            <a
              role="link"
              className="message-search-result-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-link" />
            </a>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="open-a-direct-message">Copy</Tooltip>}
          >
            <a
              role="link"
              className="message-search-result-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-clipboard" />
            </a>
          </OverlayTrigger>
        </div>
        <div className="message-pool">
          <MessageHead
            timestamp="2017-01-01"
            user={{ first_name: "John", last_name: "Smith" }}
          />
          {getMessageText("test message", sidemenuStore.usernameMap)}
        </div>
      </div>
    );
  }
}

export default SearchResultItem;
