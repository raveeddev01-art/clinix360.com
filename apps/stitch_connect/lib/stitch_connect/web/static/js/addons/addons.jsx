import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import AddonMasterPanel from "./addon-master-panel.jsx";
import AddonDetailPanel from "./addon-detail-panel.jsx";

@inject("addonStore")
@observer
class Addons extends Component {
  _toggleAddons = () => {
    this.props.addonStore.toggleAddons();
  };

  render() {
    const { addonStore } = this.props;
    const className = cx({
      "open-addons": addonStore.showAddons
    });

    return (
      <div id="addons" className={className}>
        <div className="flex-header">
          {addonStore.showAddonDetail &&
            <a className="open-left" onClick={addonStore.toggleAddonDetail}>
              <i className="fa fa-chevron-left" />
            </a>}
          <h4>Info</h4>
          <a onClick={this._toggleAddons}>
            <i className="fa fa-close" />
          </a>
        </div>

        <div className="flex-content">
          <AddonMasterPanel />
          <AddonDetailPanel />
        </div>
      </div>
    );
  }
}

export default Addons;
