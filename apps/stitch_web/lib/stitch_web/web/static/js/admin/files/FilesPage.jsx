import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FileList from "./components/FileList";
import ListFilter from "./components/FileList/ListFilter";

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
            <i className="fa fa-folder-open" /> Files
          </h1>
        </Panel.Heading>
        <Panel.Body>
          <Nav
            bsStyle="tabs"
            activeKey={this.state.tab}
            onSelect={this.onSelectTab}
          >
            <NavItem eventKey="all">All Files</NavItem>
            <NavItem eventKey="yours">Your Files</NavItem>
          </Nav>
          <div className="tab-content">
            <Row>
              <Col sm={8}>
                <FileList />
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
