import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Media, DropdownButton, MenuItem, Button, Grid, Row, Col, FormControl, FormGroup, ControlLabel } from "react-bootstrap";

@inject("usersStore", "teamFileStore", "titleStore")
@observer
class FileComment extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  deleteComment() {
    this.props.teamFileStore.deleteComment(this.props.comment.id)
  }

  renderActions() {
    const comment = this.props.comment;

    return (
      <div style={{ textAlign: "right" }}>
        <DropdownButton pullRight
          bsStyle={"default"}
          title={"Actions"}
          id={`comment-action-dropdwon-${comment.id}`}
          onSelect={e => null}>
          <MenuItem eventKey="1">Edit</MenuItem>
          <MenuItem eventKey="2" onClick={e => this.deleteComment()}>Delete</MenuItem>
        </DropdownButton>
      </div>
    )
  }

  render() {
    const comment = this.props.comment;
    const user = this.props.usersStore.usersById[comment.user_id];

    return (
      <div key={comment.id} className="well">
        {currentUser.id == comment.user_id &&
          this.renderActions()}
        <Media>
          <Media.Left>
            <img className="img-circle" src={user.avatar_thumb} style={{ width: "30px", height: "30px" }} />
          </Media.Left>
          <Media.Body>
            <Media.Heading>{user.full_name}</Media.Heading>
            <p>
              {comment.text_content}
            </p>
          </Media.Body>
        </Media>
      </div>
    )
  }
}

export default FileComment;
