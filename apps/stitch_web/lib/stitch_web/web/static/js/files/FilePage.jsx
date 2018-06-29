import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { DropdownButton, MenuItem, Button, Grid, Row, Col } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import prettyBytes from "pretty-bytes";
import moment from "moment";

import FileAttachment from "../common/components/messages/message-content/file-attachment/index";
import FileComment from "./FileComment";
import FileCommentInput from "./FileCommentInput";
import FileHeading from "./FileHeading";

const FileThumb = ({ file }) =>
  <FileAttachment api_url={file.url} {...file} />

const FileInfo = ({ file }) => {
  let prettySize = prettyBytes(file.size_in_bytes);
  let extension = file.filetype;
  let addedOn = moment(file.inserted_at).format("D MMMM, YYYY");
  let accessPerm = file.public ? "" : "This file is private";
  return `${prettySize} ${extension} added on ${addedOn}. ${accessPerm}`
}

@inject("usersStore", "teamFileStore", "titleStore")
@observer
class FilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: ""
    };
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      const encodedFileId = "f" + this.props.match.params.id;
      this.props.teamFileStore.load(encodedFileId).then(file =>
        this.props.titleStore.setPageName(file.filename)
      );
    }
  }

  createPublicLink() {
    this.props.teamFileStore.createPublicLink()
  }

  revokePublicLink() {
    this.props.teamFileStore.revokePublicLink()
  }

  renderPublicLink() {
    const file = this.props.teamFileStore.file;
    const url = `${file.url}?public_token=${file.public_token}`;
    return (
      <div className="well">
        Public Link: <a href={url}>{url}</a>
        <Button bsStyle="danger" onClick={_ => this.revokePublicLink()}>
          Revoke
        </Button>
      </div>
    )
  }

  deleteFile() {
    this.props.teamFileStore.deleteFile()
      .then(f => this.props.history.push('/files'));
  }

  downloadFile() {
    const w = window.open(this.props.teamFileStore.file.url, '_blank');
    w.focus();
  }

  rednerFile(file, user) {
    return (
      <div>
        <div>
          {file && file.id && <FileInfo file={file} />}
        </div>
        {!!file.public_token && this.renderPublicLink()}
        <Grid>
          <Row>
            <Col xs={12} md={8}>
              {file && file.id && <FileThumb file={file} />}
            </Col>
            <Col xs={6} md={4}>
              <DropdownButton pull="right" bsStyle={"default"} title={"Actions"} id="file-action-dropdwon" onSelect={e => null}>
                <MenuItem eventKey="1" onClick={e => this.downloadFile()}>Download</MenuItem>
                <MenuItem divider />
                {file && file.public_token
                  ? <MenuItem eventKey="2" onClick={e => this.revokePublicLink()}>Remove External Link</MenuItem>
                  : <MenuItem eventKey="2" onClick={e => this.createPublicLink()}>Create External Link</MenuItem>}
                {currentUser.id == file.user_id &&
                  <MenuItem eventKey="3" onClick={e => this.deleteFile()}>Delete</MenuItem>
                }
              </DropdownButton>
            </Col>
          </Row>
          <Row>
            {file && file.comments && file.comments.map(comment =>
              <FileComment comment={comment} key={comment.id} />
            )}
            <FileCommentInput file={file} />
          </Row>
        </Grid>
      </div>
    )
  }

  render() {
    const file = this.props.teamFileStore.file;
    const user = this.props.usersStore.usersById[file.user_id];

    return (
      <Panel className="home-panel">
        <Panel.Heading>
          <FileHeading user={user} file={file} />
        </Panel.Heading>
        <Panel.Body>
          {file.id && this.rednerFile(file, user)}
        </Panel.Body>
      </Panel >
    );
  }
}

export default FilePage;
