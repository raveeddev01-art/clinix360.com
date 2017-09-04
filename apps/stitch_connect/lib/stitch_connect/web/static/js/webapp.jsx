import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Dropzone from "react-dropzone";
import Sidemenu from "./sidemenu/sidemenu";
import Chat from "./chat/chat";
import UploadModal from "./file-upload/upload-modal";

import RootStore from "./common/stores/root_store";

export default class Webapp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropzoneActive: false
    };
    this.rootStore = new RootStore(props);
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
      this.rootStore.uploadStore.openUploadModal(files[0]);
    }

    this.setState({
      dropzoneActive: false
    });
  };

  setDropzoneRef = ref => {
    this.rootStore.uploadStore.dropzoneRef = ref;
  };

  render() {
    return (
      <Router>
        <Provider {...this.rootStore}>
          <Dropzone
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
            <Switch>
              <Route exact path={`/`} component={Chat} />
              <Route path={`/groups/:slug`} component={Chat} />
              <Route path={`/direct/:usernames`} component={Chat} />
            </Switch>
          </Dropzone>
        </Provider>
      </Router>
    );
  }
}
