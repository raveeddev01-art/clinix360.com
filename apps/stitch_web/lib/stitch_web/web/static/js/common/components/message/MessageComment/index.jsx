import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Message from "../../../../chat/message-list/message";
import MessageCommentInput from "../MessageCommentInput";


@inject("usersStore", "teamFileStore", "messageStore")
@observer
class MessageComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      commentText: props.comment.text_content || ''
    };
    this.editComment = this.editComment.bind(this);
  }

  // deleteComment = () => {
  //   confirmModal({
  //     title: "Delete Comment",
  //     message:
  //       "Are you sure you want to delete this comment? This cannot be undone.",
  //     okLabel: "Delete"
  //   }).then(() => {
  //     const { messageStore, comment } = this.props;
  //     messageStore.deleteMessageComment(comment.id);
  //   });
  // };

  editComment = () => {
    this.setState({ editing: true });
  };

  // handleEditInputChange = e => {
  //   this.setState({ commentText: e.target.value });
  // };

  // handleCancelEdit = () => {
  //   const { comment } = this.props;

  //   this.setState({
  //     editing: false,
  //     commentText: comment.text_content
  //   });
  // };

  handleSaveEdit = (commentText) => {
    const { comment, messageStore } = this.props;

    messageStore.updateMessageComment(comment.id, commentText).then(() => {
      this.setState({ editing: false });
    });
  };

  // renderActions() {
  //   const { comment } = this.props;

  //   return (
  //     <div className="file-comment__action">
  //       <Dropdown id={`comment-action-dropdown-${comment.id}`}>
  //         <ActionToggle bsRole="toggle">
  //           <i className="file-comment__action fa fa-gear" />
  //         </ActionToggle>
  //         <Dropdown.Menu>
  //           {isOwner(comment) && (
  //             <MenuItem eventKey="1" onClick={this.editComment}>
  //               Edit
  //             </MenuItem>
  //           )}
  //           <MenuItem eventKey="2" onClick={this.deleteComment}>
  //             Delete
  //           </MenuItem>
  //         </Dropdown.Menu>
  //       </Dropdown>
  //     </div>
  //   );
  // }

  // renderEditInput() {
  //   return (
  //     <FormGroup className="file-comment__edit">
  //       <FormControl
  //         type="text"
  //         value={this.state.commentText}
  //         onChange={this.handleEditInputChange}
  //       />
  //       <div className="file-comment__edit-buttons">
  //         <Button onClick={this.handleCancelEdit}>Cancel</Button>
  //         <Button bsStyle="primary" onClick={this.handleSaveEdit}>
  //           Save
  //         </Button>
  //       </div>
  //     </FormGroup>
  //   );
  // }

  // renderDetail() {
  //   const { comment } = this.props;

  //   return (
  //     <div className="file-comment__details">
  //       <div className="file-comment__details-header">
  //         <TimestampTooltip timestamp={comment.inserted_at} className="time" />
  //         {(isOwner(comment) || isAdmin()) && this.renderActions()}
  //       </div>
  //       <p>{comment.text_content}</p>
  //     </div>
  //   );
  // }

  // renderTimestamp() {
  //   const { comment } = this.props;

  //   return (
  //     <div className="file-comment__details">
  //       <div className="file-comment__details-header">
  //         <TimestampTooltip timestamp={comment.inserted_at} className="time" />
  //         {(isOwner(comment) || isAdmin()) && this.renderActions()}
  //       </div>
  //     </div>
  //   );
  // }

  // renderCommentText () {
  //   const { comment } = this.props;

  //   return (
  //     <div className="comment-text">
  //       <p>{comment.text_content}</p>
  //     </div>
  //   );
  // }

  renderEditInput() {
    const { comment } = this.props;

    return (
      <MessageCommentInput
        message={comment}
        commentText={comment.text_content}
        editing={true}
        handleSaveEdit={this.handleSaveEdit}
      />
    );
  }

  renderCommentContent() {
    const { comment, messageStore, usersStore } = this.props;
    const user = usersStore.usersById[comment.user_id];

    return (
      <Message
        edited_at={comment.edited_at}
        onStartEditCallback={this.editComment}
        isReply={true}
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
    )
  }

  render() {
    const { editing } = this.state;

    return (
      <div className="">
        {editing ? this.renderEditInput() : this.renderCommentContent()}
      </div>
    );
  }
}

MessageComment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired
};

export default MessageComment;
