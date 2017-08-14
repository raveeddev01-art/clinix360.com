import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import Info from "./components/info/info";
import Directory from "./components/directory/directory";

import PeopleDetail from "./components/people-detail/people-detail";

@inject("addonStore")
@observer
class Addons extends Component {
  toggleAddons = () => {
    this.props.addonStore.toggleAddons();
  };

  toggleAddonDetail = () => {
    this.props.addonStore.toggleAddonDetail();
  };

  render() {
    const { addonStore } = this.props;
    const addonsClass = cx({
      opened: addonStore.showAddons
    });
    const leftPanelClass = cx("addon-left-panel", {
      opened: !addonStore.showAddonDetail
    });
    const rightPanelClass = cx("addon-right-panel", {
      opened: addonStore.showAddonDetail
    });

    const addonPanelTitle = addonStore.addonPanelType;

    return (
      <div id="addons" className={addonsClass}>
        <div className="flex-header">
          {addonStore.showAddonDetail &&
            <a
              className="open-left"
              role="button"
              onClick={this.toggleAddonDetail}
            >
              <i className="fa fa-chevron-left" />
            </a>}
          <h4 className="text-capitalize">
            {addonPanelTitle}
          </h4>
          <a role="button" onClick={this.toggleAddons}>
            <i className="fa fa-close" />
          </a>
        </div>

        <div className="flex-content">
          <div className={leftPanelClass}>
            {addonStore.addonPanelType === "info" && <Info />}
            {addonStore.addonPanelType === "directory" && <Directory />}
          </div>

          <div className={rightPanelClass}>
            {addonStore.detailPanelType === "people" &&
              <PeopleDetail user={addonStore.detailPanelData} />}
          </div>
        </div>
      </div>
    );
  }
}

export default Addons;
