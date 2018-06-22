import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import { Grid, Row, Col, FormGroup, ControlLabel } from "react-bootstrap";
import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
// import SearchInputDropdownMention from "./search-input-dropdown-mention";
// import { inject, observer } from "mobx-react";
import { inject, observer } from "mobx-react";
import moment from "moment";
import { stringify } from "qs";

import RootStore from "../common/stores/root_store";
import TeamFilesStore from "../common/stores/team_files_store";

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
    "position": "absolute",
    "top": "10px",
    "left": "9px",
    marginTop: " - 1px",
    fontSize: "24px",
    "display": "flex",
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
  componentWillMount() {
    this.props.teamFilesStore.search();
  }

  applyFilter(selected) {
    console.log('filter ', selected);

    if (selected.length == 0) {
      console.log('no fitler');
      return this.props.teamFilesStore.search({
        creator_id: null
      });
    } else {
      console.log('single fitler');
      const [user] = selected;
      return this.props.teamFilesStore.search({
        creator_id: user.id
      });
    }
  }

  render() {
    const usersMap = this.props.usersStore.usersById;
    const users = this.props.usersStore.users.toJS();

    return (
      <Panel className="home-panel">
        <Panel.Heading>
          <h1>Files</h1>
        </Panel.Heading>

        <Panel.Body>
          <Nav bsStyle="pills" activeKey={1} >
            <NavItem eventKey={1} href="/home">All Files</NavItem>
            <NavItem eventKey={2} title="Item">My Files</NavItem>
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
              </Col>
              <Col xs={6} md={4}>
                <FormGroup controlId="formBasicText">
                  <ControlLabel>Uploaded by</ControlLabel>
                  <Typeahead
                    labelKey="full_name"
                    multiple={false}
                    options={users}
                    onChange={selected => {
                      console.log([selected, "changed"])
                      this.applyFilter(selected);
                    }}
                    renderMenuItemChildren={(user) => (
                      <div className=".user-list-item" key={user.id}>
                        <div className="item-text" style={{ flexGrow: 1, display: "flex" }}>
                          <div className="avatar">
                            <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
                          </div>
                          <span className="username">{user.full_name}</span>
                          <span className="text-muted">{user.username}</span>
                        </div>
                      </div>
                    )}
                    placeholder="Search by name" />
                </FormGroup>
                <FormGroup controlId="formBasicText">
                  <ControlLabel>File name</ControlLabel>
                  <Typeahead
                    labelKey="full_name"
                    multiple={false}
                    options={users}
                    placeholder="File type" />
                </FormGroup>
                <FormGroup controlId="formBasicText">
                  <ControlLabel>File name</ControlLabel>
                  <Typeahead
                    labelKey="full_name"
                    multiple={false}
                    options={users}
                    placeholder="Search by name" />
                </FormGroup>
              </Col>
            </Row>
          </Grid>
          <code>
            {this.props.teamFilesStore.meta}
          </code>
        </Panel.Body>
      </Panel >
    );
  }
}

export default FileList;
