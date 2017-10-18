import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";

import Sidemenu from "../sidemenu/sidemenu";
import Chat from "./chat";
import BrowserNotificationAlert from "./browser-notification-alert";
import UploadModal from "../file-upload/upload-modal";

@inject("uploadStore", "sidemenuStore")
@observer
class ChatApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropzoneActive: false
    };
  }

  componentDidMount() {
    const { sidemenuStore, history } = this.props;

    sidemenuStore.setHistory(history);
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
        <BrowserNotificationAlert />
        <div className="appContainer">
          <Sidemenu />
          <Switch>
            <Route path={`/rooms/:slug`} component={Chat} />
            <Route path={`/direct/:usernames`} component={Chat} />
            <Route component={() => <Redirect to="/rooms/general" />} />
          </Switch>
        </div>
      </Dropzone>
    );
  }
}

export default withRouter(ChatApp);
