import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { isAdmin } from "lib/utils";
import { Avatar, TimestampTooltip } from "common/components";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { confirmModal } from "common/modals";
import ActionToggle from "./ActionToggle";
import Message from "../../../../chat/message-list/message";

const isOwner = comment => {
  return comment.user_id === currentUser.id;
};

@inject("usersStore", "teamFileStore", "messageStore")
@observer
class MessageComment extends Component {
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
      const { messageStore, comment } = this.props;
      messageStore.deleteMessageComment(comment.id);
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
    const { comment, messageStore } = this.props;
    const { commentText } = this.state;

    messageStore.updateMessageComment(comment.id, commentText).then(() => {
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
            {isOwner(comment) && (
              <MenuItem eventKey="1" onClick={this.editComment}>
                Edit
              </MenuItem>
            )}
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
          {(isOwner(comment) || isAdmin()) && this.renderActions()}
        </div>
        <p>{comment.text_content}</p>
      </div>
    );
  }

  renderTimestamp() {
    const { comment } = this.props;

    return (
      <div className="file-comment__details">
        <div className="file-comment__details-header">
          <TimestampTooltip timestamp={comment.inserted_at} className="time" />
          {(isOwner(comment) || isAdmin()) && this.renderActions()}
        </div>
      </div>
    );
  }

  renderCommentText () {
    const { comment } = this.props;

    return (
      <div className="comment-text">
        <p>{comment.text_content}</p>
      </div>
    );
  }

  render() {
    const { usersStore, comment, messageStore } = this.props;
    const { editing } = this.state;
    const user = usersStore.usersById[comment.user_id];

    return (
      <div className="">
        <Message
          edited_at={comment.edited_at}
          messageUser={user}
          pinned={comment.pinned}
          starred={comment.starred}
          status={comment.status}
          is_sequential={comment.is_sequential}
          reactions_web={comment.reactions_web}
          link_previews={comment.link_previews}
          key={`comment_${comment.id}`}
          message={comment}
          lastOtherUserMessage={messageStore.lastOtherUserMessage}
          messageStore={messageStore}
          chatDiv={messageStore.chatDiv}
          onMounted={messageStore.onMessageMounted}
          onUnmounted={messageStore.onMessageUnmounted}
          onShow={messageStore.onMessageShow}
          onHide={messageStore.onMessageHide}
        />

        {/* <Avatar user={user} />
        <UserProfileMenu user={user} className="name" showMutedUsername={false}>
          {user.full_name}
        </UserProfileMenu>
        {this.renderTimestamp()}

        <div className="comment-content">
          {editing ? this.renderEditInput() : this.renderCommentText()}
        </div> */}
      </div>
    );
  }
}

MessageComment.propTypes = {
  comment: PropTypes.shape({
    text_content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  }).isRequired
};

export default MessageComment;
