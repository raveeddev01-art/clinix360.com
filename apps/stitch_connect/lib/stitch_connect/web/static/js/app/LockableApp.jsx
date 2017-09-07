import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Route, withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";

import Sidemenu from "../sidemenu/sidemenu";
import Chat from "../chat/chat";
import UploadModal from "../file-upload/upload-modal";
import Lockout from "../lockout/lockout";

@inject("sidemenuStore", "uploadStore")
@observer
class LockableApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropzoneActive: false
    };
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
    return this.props.sidemenuStore.locked
      ? <Lockout />
      : <Dropzone
          id="app"
          disableClick
          style={{}}
          onDrop={this.onDrop}
          ref={this.setDropzoneRef}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          {this.state.dropzoneActive &&
            <div className="dropzone-overlay">
              <div>Drop to Upload File</div>
            </div>}
          <UploadModal />
          <Sidemenu />
          <Route exact path={`/`} component={Chat} />
          <Route path={`/groups/:slug`} component={Chat} />
          <Route path={`/direct/:usernames`} component={Chat} />
        </Dropzone>;
  }
}

export default withRouter(LockableApp);
