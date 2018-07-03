import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Tabs from "react-bootstrap/lib/Tabs";
import Tab from "react-bootstrap/lib/Tab";
import FileList from "./components/FileList";

@inject("teamFilesStore", "usersStore")
@observer
class FilesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "all"
    };
  }

  componentWillMount() {
    this.props.teamFilesStore.search();
  }

  onSelectTab = eventKey => {
    const { teamFilesStore } = this.props;
    this.setState({ tab: eventKey });
    teamFilesStore.setUserFilter(
      eventKey === "all" ? undefined : currentUser.id
    );
  };

  render() {
    return (
      <Panel className="admin-panel tabs-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-file" /> Files
          </h1>
        </Panel.Heading>
        <Panel.Body>
          <Tabs
            id="admin-files-tabs"
            activeKey={this.state.tab}
            onSelect={this.onSelectTab}
            unmountOnExit
          >
            <Tab eventKey="all" title="All Files">
              <FileList />
            </Tab>
            <Tab eventKey="mine" title="My Files">
              <FileList />
            </Tab>
          </Tabs>
        </Panel.Body>
      </Panel>
    );
  }
}

export default FilesPage;
