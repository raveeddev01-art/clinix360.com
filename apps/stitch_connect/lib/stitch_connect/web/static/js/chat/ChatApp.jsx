import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";

import UploadModal from "file-upload/upload-modal";
import { Switcher, AppAlert } from "common/components";
import RoleChangedModal from "common/modals/role-changed-modal";
import Chat from "./Chat";
import Sidemenu from "../sidemenu/sidemenu";

@inject("uploadStore", "sidemenuStore", "groupsStore")
@observer
class ChatApp extends Component {
  static requiresAdmin = false;

  constructor(props) {
    super(props);

    this.state = {
      dropzoneActive: false
    };
  }

  componentWillMount() {
    const { sidemenuStore } = this.props;

    sidemenuStore.isInChat = true;
  }

  componentWillUnmount() {
    const { groupsStore, sidemenuStore } = this.props;

    groupsStore.onClosedGroup();
    sidemenuStore.isInChat = false;
  }

  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    });
  };

  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    });
  };

  onDrop = files => {
    if (files.length) {
      this.props.uploadStore.openUploadModal(files[0]);
    }

    this.setState({
      dropzoneActive: false
    });
  };

  setDropzoneRef = ref => {
    this.props.uploadStore.dropzoneRef = ref;
  };

  render() {
    const { groupsStore: { defaultGroup } } = this.props;

    return (
      <Dropzone
        id="app"
        disableClick
        style={{}}
        onDrop={this.onDrop}
        ref={this.setDropzoneRef}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
      >
        {this.state.dropzoneActive && (
          <div className="dropzone-overlay">
            <div>Drop to Upload File</div>
          </div>
        )}
        <UploadModal />
        <AppAlert />
        <div className="appContainer">
          <Switcher />
          <Sidemenu />
          <Switch>
            <Route path={`/rooms/:slug`} component={Chat} />
            <Route path={`/direct/:usernames`} component={Chat} />
            {defaultGroup && (
              <Redirect from="*" to={`/rooms/${defaultGroup.slug}`} />
            )}
          </Switch>
          <RoleChangedModal />
        </div>
      </Dropzone>
    );
  }
}

export default withRouter(ChatApp);
