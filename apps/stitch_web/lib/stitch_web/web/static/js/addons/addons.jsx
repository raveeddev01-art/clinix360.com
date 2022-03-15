import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import Info from "./components/info/info";
import Directory from "./components/directory/directory";
import MessageSearch from "./components/message-search/message-search";
import FileDetails from "./components/file-details/FileDetails";
import MessageDetails from "./components/message-details/messageDetails";
import GlobalStarredMessages from "./components/global-starred-messages/global-starred-messages";

import PeopleDetail from "./components/people-detail/people-detail";
import Mentions from "./components/mentions/mentions";
import Files from "./components/files/files";
import FileDrawer from "./components/file-drawer";
import Updates from "./components/updates/updates";

@inject("addonStore", "searchStore", "desktopStore")
@observer
class Addons extends Component {

  toggleAddons = () => {
    const { addonStore, searchStore } = this.props;

    addonStore.toggleAddons();
    addonStore.reset();

    if (addonStore.addonPanelType === "Search Results") {
      searchStore.reset();
    }
  };

  toggleAddonDetail = () => {
    this.props.addonStore.toggleAddonDetail();
  };

  resetDownload = () => {
    this.props.desktopStore.send('resetList');
  }

  render() {
    const { addonStore } = this.props;

    // unmount addon panel when hidden so that all panels starts as collapsed
    if (!addonStore.showAddons) {
      return null;
    }

    const showAddonDetail = addonStore.addonPanelType === "thread" ? true : addonStore.showAddonDetail;

    const leftPanelClass = cx("addon-left-panel", {
      opened: !showAddonDetail
    });
    const rightPanelClass = cx("addon-right-panel", {
      opened: showAddonDetail
    });

    const addonPanelTitle = addonStore.addonPanelType;

    return (
      <div id="addons" className="opened">
        <div className="flex-header">
          {addonStore.showAddonDetail && (
            <a
              className="open-left"
              role="button"
              onClick={this.toggleAddonDetail}
            >
              <i className="fa fa-chevron-left" />
            </a>
          )}
          <h4 className="text-capitalize">{addonPanelTitle}</h4>
          {addonStore.addonPanelType === "downloads" && <a className="file-drawer-clear" onClick={this.resetDownload}>
            Clear All
          </a>}
          <a role="button" onClick={this.toggleAddons}>
            <i className="fa fa-close" />
          </a>
        </div>

        <div className="flex-content">
          <div className={leftPanelClass}>
            {addonStore.addonPanelType === "Room Information" && <Info />}
            {addonStore.addonPanelType === "directory" && <Directory />}
            {addonStore.addonPanelType === "Search Results" && (
              <MessageSearch />
            )}
            {addonStore.addonPanelType === "mentions" && <Mentions />}
            {addonStore.addonPanelType === "starred" && (
              <GlobalStarredMessages />
            )}
            {addonStore.addonPanelType === "files" && <Files />}
            {addonStore.addonPanelType === "thread" && <MessageDetails message={addonStore.detailPanelData} />}
            {addonStore.addonPanelType === "Updates" && <Updates />}
            {addonStore.addonPanelType === "downloads" && <FileDrawer />}
          </div>

          <div className={rightPanelClass}>
            {addonStore.detailPanelType === "File Details" && (
              <FileDetails message={addonStore.detailPanelData} />
            )}
            {addonStore.detailPanelType === "Message Details" && (
              <MessageDetails message={addonStore.detailPanelData} />
            )}
            {addonStore.detailPanelType === "people" && (
              <PeopleDetail user={addonStore.detailPanelData} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Addons;
