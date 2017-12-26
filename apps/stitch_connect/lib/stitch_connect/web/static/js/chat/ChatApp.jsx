import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";

import Sidemenu from "../sidemenu/sidemenu";
import Chat from "./Chat";
import BrowserNotificationAlert from "./browser-notification-alert";
import UploadModal from "file-upload/upload-modal";
import Switcher from "common/components/switcher";

@inject("uploadStore", "sidemenuStore", "channelStore", "groupsStore")
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
    this.props.sidemenuStore.isInChat = true;
  }

  componentWillUnmount() {
    this.props.channelStore.leaveGroupChannel();
    this.props.sidemenuStore.isInChat = false;
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
    const { defaultGroup } = this.props.groupsStore;

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
        {window.Notification && <BrowserNotificationAlert />}
        <div className="appContainer">
          <Switcher />
          <Sidemenu />
          <Switch>
            <Route path="/rooms/:slug" component={() => <Chat />} />
            <Route path="/direct/:usernames" component={() => <Chat />} />
            {defaultGroup && (
              <Redirect from="*" to={`/rooms/${defaultGroup.slug}`} />
            )}
          </Switch>
        </div>
      </Dropzone>
    );
  }
}

export default withRouter(ChatApp);
