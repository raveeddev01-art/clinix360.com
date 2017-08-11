import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import Info from "./components/info/info.jsx";
import Directory from "./components/directory/directory.jsx";

import PeopleDetail from "./components/people-detail/people-detail.jsx";

@inject("addonStore")
@observer
class Addons extends Component {
  _toggleAddons = () => {
    this.props.addonStore.toggleAddons();
  };

  _toggleAddonDetail = () => {
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

    const addonPanelTitle = addonStore.addonPanelType && addonStore.addonPanelType.capitalize();

    return (
      <div id="addons" className={addonsClass}>
        <div className="flex-header">
          {addonStore.showAddonDetail &&
            <a className="open-left" onClick={this._toggleAddonDetail}>
              <i className="fa fa-chevron-left" />
            </a>}
          <h4>{addonPanelTitle}</h4>
          <a onClick={this._toggleAddons}>
            <i className="fa fa-close" />
          </a>
        </div>

        <div className="flex-content">
          <div className={leftPanelClass}>
            {addonStore.addonPanelType === "info" &&
              <Info />}
            {addonStore.addonPanelType === "directory" &&
              <Directory />}
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
