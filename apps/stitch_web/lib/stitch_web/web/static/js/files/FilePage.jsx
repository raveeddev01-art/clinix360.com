import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { Media, DropdownButton, MenuItem, Button, Grid, Row, Col, FormControl, FormGroup, ControlLabel } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import prettyBytes from "pretty-bytes";
import moment from "moment";

import FileAttachment from "../common/components/messages/message-content/file-attachment/index";
import FileComment from "./FileComment";

const FileHeading = ({ user, file }) => {
  if (user) {
    return (
      <div>
        <div className="avatar">
          <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
        </div>

        <h4>{user.full_name}</h4>
        <strong>{file.filename}</strong>
      </div>
    )
  }
  return <div></div>
}

const FileThumb = ({ file }) => {
  // window.f = file
  // console.log('file: ', file)
  // // console.log(file.toJS())
  // const style = {
  //   marginTop: " - 1px",
  //   fontSize: "24px",
  //   backgroundImage: `url("${file.preview_url}")`,
  //   width: "50px",
  //   height: "50px",
  //   backgroundColor: "#f3f3f3",
  //   backgroundSize: "cover",
  //   backgroundPosition: "center",
  //   backgroundRepeat: "no-repeat",
  //   borderRadius: "4px",
  // }
  // if (!!file.preview_url) {
  //   return (
  //     <i style={style} data-original="" className="" ></i>
  //   )
  // }

  return (
    <FileAttachment api_url={file.url} {...file} />
  )
}

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
    window.FilePage = this;
    this.state = {
      commentText: ""
    };
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      const encodedFileId = "f" + this.props.match.params.id;
      this.props.teamFileStore.load(encodedFileId, (file) => {
        this.props.titleStore.setPageName(file.filename);
      });
    }
  }

  createPublicLink() {
    this.props.teamFileStore.createPublicLink()
  }

  renderPublicLink() {
    const file = this.props.teamFileStore.file;
    const url = `${file.url}?public_token=${file.public_token}`;
    return (
      <div className="well">
        Public Link: <a href={url}>{url}</a>
        <Button bsStyle="danger" onClick={_ => this.props.teamFileStore.revokePublicLink()}>
          Revoke
        </Button>
      </div>
    )
  }

  deleteFile() {
    this.props.teamFileStore.deleteFile(f => {
      this.props.history.push('/files');
    });
  }

  handleChange(e) {
    this.setState({ commentText: e.target.value });
  }

  addComment() {
    this.props.teamFileStore.addComment(this.state.commentText, e => {
      this.setState({ commentText: "" })
    })
  }

  rednerCommentInput(user) {
    return (
      <Col md={6}>
        <div className="avatar">
          <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
        </div>
        <FormGroup controlId="file-comment">
          <FormControl
            componentClass="textarea"
            placeholder="textarea"
            value={this.state.commentText}
            onChange={e => this.handleChange(e)} />
        </FormGroup>
        <Button bsStyle="success" onClick={_ => this.addComment()}>
          {"Add Comment"}
        </Button>
      </Col>
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
                  <MenuItem eventKey="1">Download</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey="2" onClick={e => this.createPublicLink()}>Create External Link</MenuItem>
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
              {user && this.rednerCommentInput(user)}
            </Row>
          </Grid>

        </Panel.Body>
      </Panel >
    );
  }
}

export default FilePage;
