import React from "react";

import AddonCollapse from "./addon-collapse/addon-collapse";
import RoomDetails from "./room-details/room-details";
import PeopleList from "../people-list/people-list";
import PinnedMessages from "./pinned-messages/pinned-messages";
// import StarredMessages from "./starred-messages/starred-messages";
import Files from "../files/files";
import NotificationPreferences from "./notification-preferences/notification-preferences";

const Info = () => (
  <div className="info-addon">
    <AddonCollapse icon="file-text" title="Details">
      <RoomDetails />
    </AddonCollapse>
    <AddonCollapse icon="group" title="Members">
      <PeopleList />
    </AddonCollapse>
    <AddonCollapse icon="thumb-tack" title="Pinned">
      <PinnedMessages />
    </AddonCollapse>
    {/* <AddonCollapse icon="star" title="Starred">
          <StarredMessages />
        </AddonCollapse>
        <AddonCollapse icon="list" title="Tasks">
          <p>placeholder</p>
        </AddonCollapse> */}
    <AddonCollapse icon="folder-open" title="Files">
      <Files />
    </AddonCollapse>
    {/* <AddonCollapse icon="flask" title="Labs">
          <p className="text-muted">Add the first lab!</p>
        </AddonCollapse>
        <AddonCollapse icon="address-card-o" title="Referrals">
          <p className="text-muted">Add the first referral!</p>
        </AddonCollapse>
        <AddonCollapse icon="check-square-o" title="Checklists">
          <p className="text-muted">Add the first checklist!</p>
        </AddonCollapse>
        <AddonCollapse icon="medkit" title="Prescriptions">
          <p className="text-muted">Add the first prescription!</p>
        </AddonCollapse>
        <AddonCollapse icon="bookmark-o" title="Clinical Notes">
          <p className="text-muted">Add the first lab!</p>
        </AddonCollapse>
        <AddonCollapse icon="flask" title="Labs">
          <p className="text-muted">Add the first clinical note!</p>
        </AddonCollapse> */}
    <AddonCollapse icon="bell" title="Notifications">
      <NotificationPreferences />
    </AddonCollapse>
  </div>
);

export default Info;
