import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";
import PeopleDetail from "./components/people-detail/people-detail.jsx";

@inject("addonStore")
@observer
class AddonDetailPanel extends Component {
  render() {
    const { addonStore } = this.props;
    const rightPanelClass = cx("addon-right-panel", {
      opened: addonStore.showAddonDetail
    });

    return (
      <div className={rightPanelClass}>
        {addonStore.detailPanelType === "people" &&
          <PeopleDetail user={addonStore.detailPanelItem} />}
      </div>
    );
  }
}

export default AddonDetailPanel;
