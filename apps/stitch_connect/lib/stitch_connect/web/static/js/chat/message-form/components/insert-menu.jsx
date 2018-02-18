import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// import Dropdown from "react-bootstrap/lib/Dropdown";
// import MenuItem from "react-bootstrap/lib/MenuItem";

@inject("uploadStore")
@observer
class InsertMenu extends Component {
  uploadFile = () => {
    this.props.uploadStore.openFileDialog();
  };

  render() {
    // @TODO enable dropdown when we have more than one menu item
    return (
      <a
        role="link"
        className="message-form-action-item"
        onClick={this.uploadFile}
      >
        <i className="fa fa-plus-square-o" />
      </a>
    );
    // return (
    //   <Dropdown id="message-insert-menu" dropup pullRight>
    //     <Dropdown.Toggle noCaret className="message-form-action-item">
    //       <i className="fa fa-plus-square-o" />
    //     </Dropdown.Toggle>
    //
    //     <Dropdown.Menu className="more-menu">
    //       <MenuItem onClick={this.uploadFile}>
    //         <i className="fa fa-folder-open" /> Files
    //       </MenuItem>
    //     </Dropdown.Menu>
    //   </Dropdown>
    // );
  }
}

export default InsertMenu;
