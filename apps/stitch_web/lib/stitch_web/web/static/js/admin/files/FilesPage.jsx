import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FileList from "common/components/file/FileList";
import ListFilter from "common/components/file/FileList/ListFilter";

@inject("teamFilesStore", "usersStore")
@observer
class FilesPage extends Component {
  componentWillMount() {
    this.props.teamFilesStore.search();
  }

  onSelectTab = eventKey => {
    const { teamFilesStore } = this.props;
    teamFilesStore.setUserFilter(
      eventKey === "all" ? undefined : currentUser.id
    );
  };

  render() {
    const { teamFilesStore } = this.props;
    const { creatorId } = teamFilesStore;
    const tab = creatorId === currentUser.id ? "yours" : "all";

    return (
      <Panel className="admin-panel tabs-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-folder-open" /> Files
          </h1>
        </Panel.Heading>
        <Panel.Body>
          <Nav bsStyle="tabs" activeKey={tab} onSelect={this.onSelectTab}>
            <NavItem eventKey="all">All Files</NavItem>
            <NavItem eventKey="yours">Your Files</NavItem>
          </Nav>
          <div className="tab-content">
            <Row>
              <Col sm={8}>
                <FileList isActionsVisible={false} />
              </Col>
              <Col sm={4}>
                <ListFilter />
              </Col>
            </Row>
          </div>
        </Panel.Body>
      </Panel>
    );
  }
}

export default FilesPage;
