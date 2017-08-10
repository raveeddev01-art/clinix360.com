import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import PeopleList from "./people-list.jsx";
import AddonCollapse from "./components/addon-collapse/addon-collapse.jsx";

@inject("addonStore")
@observer
class AddonMasterPanel extends Component {
  render() {
    const { addonStore } = this.props;
    const leftPanelClass = cx("addon-left-panel", {
      opened: !addonStore.showAddonDetail
    });

    return (
      <div className={leftPanelClass}>
        <PeopleList />
        <AddonCollapse icon="thumb-tack" title="Pinned">
          <p className="text-muted">Pin the first message!</p>
        </AddonCollapse>
        <AddonCollapse icon="star" title="Starred">
          <p className="text-muted">Star the first message!</p>
        </AddonCollapse>
        <AddonCollapse icon="list" title="Tasks">
          <p>placeholder</p>
        </AddonCollapse>
        <AddonCollapse icon="folder-open" title="Files">
          <p className="text-muted">Upload the first file!</p>
        </AddonCollapse>
        <AddonCollapse icon="flask" title="Labs">
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
        </AddonCollapse>
      </div>
    );
  }
}

export default AddonMasterPanel;
