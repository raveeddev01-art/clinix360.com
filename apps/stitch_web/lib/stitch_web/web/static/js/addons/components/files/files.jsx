import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import FileList from "admin/files/components/FileList";

@inject("teamFilesStore", "addonStore")
@observer
class Files extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "all"
    };
  }

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
    const { teamFilesStore } = this.props;
    this.setState({ tab: eventKey });
    teamFilesStore.setUserFilter(
      eventKey === "all" ? undefined : currentUser.id
    );
  };

  render() {
    return (
      <div className="files-addon">
        <Nav
          bsStyle="pills"
          activeKey={this.state.tab}
          onSelect={this.onSelectTab}
        >
          <NavItem eventKey="all">All Files</NavItem>
          <NavItem eventKey="mine">My Files</NavItem>
        </Nav>
        <FileList onFileClick={this.onFileClick} />
      </div>
    );
  }
}

export default Files;
