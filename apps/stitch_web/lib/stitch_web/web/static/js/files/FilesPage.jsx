import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import { Grid, Row, Col, FormGroup, ControlLabel } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import FiletypeSelector from "./FiletypeSelector";
import UserSelector from "./UserSelector";
import FileList from "./FileList";

@inject("teamFilesStore", "usersStore")
@observer
class FilesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myFilesOnly: 1
    };
  }

  componentWillMount() {
    this.props.teamFilesStore.search();
  }

  applyFiletypeFilter(filetypeId) {
    this.props.teamFilesStore.filterByFiletype(filetypeId)
  }

  applyUserFilter(userId) {
    this.props.teamFilesStore.search({ creator_id: userId, skip: 0 })
  }

  handleSelect(eventKey) {
    this.setState({ myFilesOnly: eventKey });
    this.props.teamFilesStore.search({ creator_id: currentUser.id, skip: 0 })
  }

  goToPage(page) {
    this.props.teamFilesStore.goToPage(page)
  }

  render() {
    const usersMap = this.props.usersStore.usersById;
    const users = this.props.usersStore.users.toJS();
    const pages = this.props.teamFilesStore.pages;
    const pageInfo = this.props.teamFilesStore.pageInfo;

    return (
      <Panel className="home-panel">
        <Panel.Heading>
          <h1>Files</h1>
        </Panel.Heading>

        <Panel.Body>
          <Nav bsStyle="pills" activeKey={this.state.myFilesOnly} onSelect={e => this.handleSelect(e)} >
            <NavItem eventKey={1}>All Files</NavItem>
            <NavItem eventKey={2}>My Files</NavItem>
          </Nav>
        </Panel.Body>
        <Panel.Body>
          <Grid>
            <Row className="show-grid">
              <Col xs={12} md={8}>
                <FileList files={this.props.teamFilesStore.files} usersMap={usersMap} pages={pages} goToPage={i => this.goToPage(i)} />
              </Col>
              <Col xs={6} md={4}>
                <FormGroup controlId="formBasicText">
                  <ControlLabel>Uploaded by</ControlLabel>
                  <UserSelector users={users} onSelect={userId => this.applyUserFilter(userId)}
                    myFilesOnly={this.state.myFilesOnly == 2} />
                </FormGroup>
                <FormGroup controlId="formBasicText">
                  <ControlLabel>File type</ControlLabel>
                  <br />
                  <FiletypeSelector
                    onSelect={filetypeId => this.applyFiletypeFilter(filetypeId)}
                    filetypes={this.props.teamFilesStore.filetypes}
                    currentType={this.props.teamFilesStore.params.filetype} />
                </FormGroup>
              </Col>
              <p>
                {`Viewing files ${pageInfo.from} to ${pageInfo.to} of ${pageInfo.count}`}
              </p>
            </Row>
          </Grid>
        </Panel.Body>
      </Panel >
    );
  }
}

export default FilesPage;
