import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("inboxStore")
@observer
class Topbar extends Component {
  onCloseConversation = () => {
    const { inboxStore } = this.props;
    inboxStore.closeConversation(inboxStore.currentConversation.id);
  };

  render() {
    const { inboxStore } = this.props;

    return (
      <div className="topbar">
        <h4>{inboxStore.currentConversation.patient.full_name}</h4>

        <div className="header-nav">
          <a role="button" onClick={this.onCloseConversation}>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-info">Close Conversation</Tooltip>}
              ref={ref => {
                this.roomInfoOverlay = ref;
              }}
            >
              <i className="fa fa-check-circle" />
            </OverlayTrigger>
          </a>

          <a role="button" onClick={this.onRoomInfoClick}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="tooltip-info">Conversation Information</Tooltip>
              }
              ref={ref => {
                this.roomInfoOverlay = ref;
              }}
            >
              <i className="fa fa-info-circle" />
            </OverlayTrigger>
          </a>

          <a role="button" onClick={this.onRoomInfoClick}>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-more">More</Tooltip>}
              ref={ref => {
                this.overlayTrigger = ref;
              }}
            >
              <span>
                <i className="fa fa-ellipsis-v" />
              </span>
            </OverlayTrigger>
          </a>
        </div>
      </div>
    );
  }
}

export default Topbar;
