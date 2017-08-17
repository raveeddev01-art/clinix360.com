import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonCollapse from "./addon-collapse/addon-collapse";
import PeopleList from "../people-list/people-list";
import PinnedMessages from "./pinned-messages/pinned-messages";

@inject("groupStore")
@observer
class Info extends Component {
  loadUsers = () => {
    this.props.groupStore.loadUsers();
  };

  render() {
    return (
      <div>
        <AddonCollapse icon="group" title="People" onCollapse={this.loadUsers}>
          <PeopleList />
        </AddonCollapse>
        <AddonCollapse icon="thumb-tack" title="Pinned">
          <PinnedMessages />
        </AddonCollapse>
        <AddonCollapse icon="star" title="Starred">
          <p className="text-muted">Star the first message!</p>
        </AddonCollapse>
        {/* <AddonCollapse icon="list" title="Tasks">
          <p>placeholder</p>
        </AddonCollapse> */}
        <AddonCollapse icon="folder-open" title="Files">
          <p className="text-muted">Upload the first file!</p>
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
      </div>
    );
  }
}

export default Info;
