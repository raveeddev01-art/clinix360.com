import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import { Grid, Row, Col, FormGroup, ControlLabel, Pagination, DropdownButton, MenuItem, } from "react-bootstrap";
import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
// import SearchInputDropdownMention from "./search-input-dropdown-mention";
// import { inject, observer } from "mobx-react";
import { inject, observer } from "mobx-react";
import moment from "moment";
import _ from "lodash";
import { stringify } from "qs";

import FiletypeSelector from "./FiletypeSelector";

import RootStore from "../common/stores/root_store";
import TeamFilesStore from "../common/stores/team_files_store";
import UserSelector from "./UserSelector";

const UserInfo = ({ usersMap, file }) => {
  const user = usersMap[file.user_id];

  // Jun 1st at 8:32 PM
  const datetime = moment(file.inserted)
  const formattedDatetime = `${datetime.format("MMM Do")} at ${datetime.format("h:mm a")}`
  return (
    <span>
      {user && `${user.first_name} ${user.last_name}`} {formattedDatetime}
    </span>
  )
}

const FileThumb = ({ file }) => {
  const style = {
    position: "absolute",
    top: "10px",
    left: "9px",
    marginTop: " - 1px",
    fontSize: "24px",
    display: "flex",
    backgroundImage: `url("${file.preview_url}")`,
    width: "50px",
    height: "50px",
    backgroundColor: "#f3f3f3",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: "4px",
  }
  if (!!file.preview_url) {
    return (
      <i style={style} data-original="" className="filetype_image lazy" ></i>
    )
  }
  return (
    <i style={style} data-original="" className="filetype_image lazy" ></i>
  )
}

@inject("teamFilesStore", "usersStore")
@observer
class FileList extends Component {
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
    this.props.teamFilesStore.search({ creator_id: userId })
  }

  myFilesOnly(bool) {
    this.state.myFilesOnly = bool;
  }

  handleSelect(eventKey) {
    this.setState({ myFilesOnly: eventKey });
    this.props.teamFilesStore.search({ creator_id: currentUser.id })
  }

  goToPage(page) {
    this.props.teamFilesStore.goToPage(page)
  }

  render() {
    const usersMap = this.props.usersStore.usersById;
    const users = this.props.usersStore.users.toJS();
    const pages = this.props.teamFilesStore.pages;
    console.log(pages);

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
                <div className="">
                  {this.props.teamFilesStore.files.map(file =>
                    <div key={file.id} style={{ position: "relative" }}>
                      <div className="action">
                      </div>
                      <FileThumb file={file} />
                      <div style={{ marginLeft: "70px", flex: 1 }}>
                        <h4>{file.filename}</h4>
                        <UserInfo usersMap={usersMap} file={file} /><br />
                        <span>{file.public ? "Public file" : "Private file"}</span>
                      </div>
                    </div>
                  )}
                </div>
                <Pagination bsSize="large">
                  {_.times(pages.totalPages, i =>
                    <Pagination.Item
                      onClick={e => this.goToPage(i)} key={i} active={i == pages.currentPage}>{i + 1}</Pagination.Item>
                  )}
                </Pagination>
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
              <code>
                {this.props.teamFilesStore.meta}
              </code>

            </Row>
          </Grid>
        </Panel.Body>
      </Panel >
    );
  }
}

export default FileList;
