import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import {
  Media,
  DropdownButton,
  MenuItem,
  FormGroup,
  FormControl,
  Button
} from "react-bootstrap";

@inject("usersStore", "teamFileStore", "titleStore")
@observer
class FileComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      commentText: props.comment.text_content
    };
  }

  componentWillMount() {}

  deleteComment() {
    this.props.teamFileStore.deleteComment(this.props.comment.id);
  }

  editComment() {
    this.setState({ editing: true });
  }

  handleEditInputChange(e) {
    this.setState({ commentText: e.target.value });
  }

  handleCancelEdit() {
    this.setState({
      editing: false,
      commentText: this.props.comment.text_content
    });
  }

  handleSaveEdit() {
    this.props.teamFileStore
      .updateComment(this.props.comment.id, this.state.commentText)
      .then(updated => {
        this.setState({ editing: false });
      });
  }

  renderActions() {
    const comment = this.props.comment;

    return (
      <div style={{ textAlign: "right" }}>
        <DropdownButton
          pullRight
          bsStyle={"default"}
          title={"Actions"}
          id={`comment-action-dropdwon-${comment.id}`}
          onSelect={e => null}
        >
          <MenuItem eventKey="1" onClick={e => this.editComment()}>
            Edit
          </MenuItem>
          <MenuItem eventKey="2" onClick={e => this.deleteComment()}>
            Delete
          </MenuItem>
        </DropdownButton>
      </div>
    );
  }

  renderEditInput() {
    return (
      <FormGroup>
        <FormControl
          componentClass="textarea"
          placeholder="textarea"
          value={this.state.commentText}
          onChange={e => this.handleEditInputChange(e)}
        />
        <Button onClick={e => this.handleCancelEdit(e)}>Cancel</Button>
        <Button bsStyle="success" onClick={e => this.handleSaveEdit(e)}>
          Save
        </Button>
      </FormGroup>
    );
  }

  render() {
    const comment = this.props.comment;
    const user = this.props.usersStore.usersById[comment.user_id];

    return (
      <div className="well">
        {currentUser.id === comment.user_id && this.renderActions()}
        <Media>
          <Media.Left>
            <img
              alt={user.full_name}
              className="img-circle"
              src={user.avatar_thumb}
              style={{ width: "30px", height: "30px" }}
            />
          </Media.Left>
          <Media.Body>
            <Media.Heading>{user.full_name}</Media.Heading>
            {this.state.editing ? (
              this.renderEditInput()
            ) : (
              <p>{comment.text_content}</p>
            )}
          </Media.Body>
        </Media>
      </div>
    );
  }
}

FileComment.propTypes = {
  comment: PropTypes.shape({
    text_content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  }).isRequired
};

export default FileComment;
