import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import ConnectTour from "common/components/joy-ride/connect-tour";
import { AppAlert, Loading, Switcher } from "common/components";
import RoleChangedModal from "common/modals/role-changed-modal";
import UploadZone from "file-upload/upload-zone";
import Sidemenu from "sidemenu/sidemenu";
import Chat from "./Chat";

@inject("sidemenuStore", "groupsStore", "messageStore")
@observer
class ChatApp extends Component {
  static requiresAdmin = false;

  componentWillMount() {
    const { sidemenuStore } = this.props;

    sidemenuStore.isInChat = true;
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyboardShortcuts);
  }

  componentWillUnmount() {
    const { groupsStore, sidemenuStore } = this.props;

    document.removeEventListener("keydown", this.handleKeyboardShortcuts);

    groupsStore.onClosedGroup();
    sidemenuStore.isInChat = false;
  }

  handleKeyboardShortcuts = e => {
    const code = e.charCode || e.keyCode;
    const hitK = code === 75;
    const commandOrControl = e.ctrlKey || e.metaKey;
    if (hitK && commandOrControl) {
      this.props.sidemenuStore.setModal("search");
      e.preventDefault();
    }
  };

  render() {
    const { groupsStore: { defaultGroup }, messageStore } = this.props;

    return (
      <div>
        {messageStore.loadedInitialMessages || <Loading />}

        <UploadZone>
          <ConnectTour />
          <AppAlert />
          <div className="appContainer">
            <Switcher />
            <Sidemenu />
            <Switch>
              <Route path={`/rooms/:slug`} component={Chat} />
              <Route path={`/direct/:usernames`} component={Chat} />
              {defaultGroup &&
                defaultGroup.type === "regular" && (
                  <Redirect from="*" to={`/rooms/${defaultGroup.slug}`} />
                )}
              {defaultGroup &&
                defaultGroup.type !== "regular" && (
                  <Redirect
                    from="*"
                    to={`/direct/${defaultGroup.users[0].username}`}
                  />
                )}
            </Switch>
            <RoleChangedModal />
          </div>
        </UploadZone>
      </div>
    );
  }
}

export default withRouter(ChatApp);
