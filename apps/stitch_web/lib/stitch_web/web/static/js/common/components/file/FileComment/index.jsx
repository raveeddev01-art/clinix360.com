import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { isAdminOrOwner } from "lib/utils";
import { Avatar, TimestampTooltip } from "common/components";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { confirmModal } from "common/modals";
import ActionToggle from "./ActionToggle";

@inject("usersStore", "teamFileStore")
@observer
class FileComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      commentText: props.comment.text_content
    };
  }

  deleteComment = () => {
    confirmModal({
      title: "Delete Comment",
      message:
        "Are you sure you want to delete this comment? This cannot be undone.",
      okLabel: "Delete"
    }).then(() => {
      const { teamFileStore, comment } = this.props;
      teamFileStore.deleteComment(comment.id);
    });
  };

  editComment = () => {
    this.setState({ editing: true });
  };

  handleEditInputChange = e => {
    this.setState({ commentText: e.target.value });
  };

  handleCancelEdit = () => {
    const { comment } = this.props;

    this.setState({
      editing: false,
      commentText: comment.text_content
    });
  };

  handleSaveEdit = () => {
    const { comment, teamFileStore } = this.props;
    const { commentText } = this.state;

    teamFileStore.updateComment(comment.id, commentText).then(() => {
      this.setState({ editing: false });
    });
  };

  renderActions() {
    const { comment } = this.props;

    return (
      <div className="file-comment__action">
        <Dropdown id={`comment-action-dropdown-${comment.id}`}>
          <ActionToggle bsRole="toggle">
            <i className="file-comment__action fa fa-gear" />
          </ActionToggle>
          <Dropdown.Menu>
            <MenuItem eventKey="1" onClick={this.editComment}>
              Edit
            </MenuItem>
            <MenuItem eventKey="2" onClick={this.deleteComment}>
              Delete
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }

  renderEditInput() {
    return (
      <FormGroup className="file-comment__edit">
        <FormControl
          type="text"
          value={this.state.commentText}
          onChange={this.handleEditInputChange}
        />
        <div className="file-comment__edit-buttons">
          <Button onClick={this.handleCancelEdit}>Cancel</Button>
          <Button bsStyle="primary" onClick={this.handleSaveEdit}>
            Save
          </Button>
        </div>
      </FormGroup>
    );
  }

  renderDetail() {
    const { comment } = this.props;

    return (
      <div className="file-comment__details">
        <div className="file-comment__details-header">
          <TimestampTooltip timestamp={comment.inserted_at} className="time" />
          {isAdminOrOwner(comment.user_id) && this.renderActions()}
        </div>
        <p>{comment.text_content}</p>
      </div>
    );
  }

  render() {
    const { usersStore, comment } = this.props;
    const { editing } = this.state;
    const user = usersStore.usersById[comment.user_id];

    return (
      <div className="file-comment">
        <Avatar user={user} />
        {editing ? this.renderEditInput() : this.renderDetail()}
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
