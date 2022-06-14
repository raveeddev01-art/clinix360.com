import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("uploadStore")
@observer
class InsertMenu extends Component {
  uploadFile = () => {
    this.props.uploadStore.openFileDialog(this.props.isComment);
  };

  render() {
    return (
      <a
        role="link"
        className="message-form-action-item"
        onClick={this.uploadFile}
      >
        <i className="fa fa-paperclip" />
      </a>
    );
  }
}

export default InsertMenu;
