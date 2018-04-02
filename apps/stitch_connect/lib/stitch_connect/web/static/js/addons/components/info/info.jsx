import React, { Component } from "react";
import { inject } from "mobx-react";

import AddonCollapse from "./addon-collapse/addon-collapse";
import RoomDetails from "./room-details/room-details";
import PeopleList from "../people-list/people-list";
import PinnedMessages from "./pinned-messages/pinned-messages";
// import StarredMessages from "./starred-messages/starred-messages";
import Files from "../files/files";
import NotificationPreferences from "./notification-preferences/notification-preferences";

@inject("pinnedMessageStore")
class Info extends Component {
  render() {
    const onCollapse = this.props.pinnedMessageStore.onCollapse;
    return (
      <div className="info-addon">
        <AddonCollapse icon="file-text" title="Details">
          <RoomDetails />
        </AddonCollapse>
        <AddonCollapse icon="group" title="Members">
          <PeopleList />
        </AddonCollapse>
        <AddonCollapse icon="thumb-tack" title="Pinned" onCollapse={onCollapse}>
          <PinnedMessages />
        </AddonCollapse>
        <AddonCollapse icon="folder-open" title="Files">
          <Files roomFiles />
        </AddonCollapse>
        <AddonCollapse icon="bell" title="Notifications">
          <NotificationPreferences />
        </AddonCollapse>
      </div>
    );
  }
}

export default Info;
