import React, { Component } from "react";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import MessageContent from "../../../common/components/message-content/message-content";
import MessageHeader from "../../../common/components/message-header/message-header";

class SearchResultItem extends Component {
  render() {
    const { message } = this.props;
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
          <MessageHeader timestamp={message.inserted_at} user={message.user} />
          <MessageContent message={message} />
        </div>
      </div>
    );
  }
}

export default SearchResultItem;
