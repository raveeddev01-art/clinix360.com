import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import FileList from "admin/files/components/FileList";

@inject("teamFilesStore", "addonStore")
@observer
class Files extends Component {
  componentWillMount() {
    this.props.teamFilesStore.search();
  }

  onFileClick = fileId => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("files");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("File Details", fileId);
  };

  onSelectTab = eventKey => {
    const { addonStore } = this.props;
    addonStore.setAddonPanelTab("files", eventKey);
  };

  render() {
    return (
      <div className="files-addon">
        <Nav
          bsStyle="pills"
          activeKey={this.props.addonStore.addonPanelTab}
          onSelect={this.onSelectTab}
        >
          <NavItem eventKey="all">All Files</NavItem>
          <NavItem eventKey="yours">Your Files</NavItem>
        </Nav>
        <FileList onFileClick={this.onFileClick} />
      </div>
    );
  }
}

export default Files;
