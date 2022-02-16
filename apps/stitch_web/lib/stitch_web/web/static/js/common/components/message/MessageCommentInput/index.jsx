import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { Avatar } from "common/components";
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
    const { message, usersStore, messageStore, groupsStore, commentText, editing, handleSaveEdit} = this.props;
    const user = usersStore.usersById[currentUser.id];
    return (
      <form className="file-comment" onSubmit={this.addComment}>
        <FormGroup className="file-comment__edit">
          <div className="flex-footer">
            <MessageForm
              editing={editing}
              commentText={ editing ? commentText : "" }
              allowTypingUsers={false}
              onEnterCallback={editing ? handleSaveEdit : this.addComment}
              messageStore={messageStore}
              currentGroup={groupsStore.currentGroup}
            />
            {!editing && <MessageCommentGroup
              message={message}
              label="Commenting in"
              showClose={false}
            />}
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
