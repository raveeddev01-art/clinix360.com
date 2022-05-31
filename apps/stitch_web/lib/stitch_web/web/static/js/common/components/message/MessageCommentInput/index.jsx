import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import MessageCommentGroup from "../MessageCommentGroup";
import MessageForm from "../../../../chat/message-form/message-form";
@inject("usersStore", "messageStore", "groupsStore")
@observer
class MessageCommentInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: ""
    };
  }

  addComment = commentText => {
    if (!commentText) {
      return;
    }

    this.props.messageStore
      .addComment(commentText)
      .then(() => this.setState({ commentText: "" }));
  };

  handleChange = e => {
    this.setState({ commentText: e.target.value });
  };

  render() {
    const { message, messageStore, groupsStore } = this.props;

    return (
      <form className="file-comment" /*onSubmit={this.addComment}*/>
        <FormGroup className="file-comment__edit">
          <div className="flex-footer">
            <MessageForm
              allowTypingUsers={false}
              onEnterCallback={this.addComment}
              messageStore={messageStore}
              currentGroup={groupsStore.currentGroup}
              inThread={true}
            />
            <MessageCommentGroup
              message={message}
              label="Commenting in"
              showClose={false}
            />
          </div>
        </FormGroup>
      </form>
    );
  }
}

MessageCommentInput.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageCommentInput;
