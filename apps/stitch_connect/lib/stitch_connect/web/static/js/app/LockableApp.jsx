import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";

import Sidemenu from "../sidemenu/sidemenu";
import Chat from "../chat/chat";
import BrowserNotificationAlert from "../chat/browser-notification-alert";
import UploadModal from "../file-upload/upload-modal";
import Lockout from "../lockout/lockout";

@inject("presenceStore", "uploadStore")
@observer
class LockableApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropzoneActive: false
    };
  }

  componentDidMount() {
    window.addEventListener("focus", this.props.presenceStore.onWindowFocus);
    window.addEventListener("blur", this.props.presenceStore.onWindowBlur);
    this.props.presenceStore.onWindowBlur();
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
    return this.props.presenceStore.locked ? (
      <Lockout />
    ) : (
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
          <Route exact path={`/`} component={Chat} />
          <Route path={`/rooms/:slug`} component={Chat} />
          <Route path={`/direct/:usernames`} component={Chat} />
        </div>
      </Dropzone>
    );
  }
}

export default withRouter(LockableApp);
