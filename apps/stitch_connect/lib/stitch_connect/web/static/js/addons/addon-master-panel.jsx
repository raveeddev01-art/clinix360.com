import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import Info from "./components/info/info.jsx";

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
        <Info />
      </div>
    );
  }
}

export default AddonMasterPanel;
