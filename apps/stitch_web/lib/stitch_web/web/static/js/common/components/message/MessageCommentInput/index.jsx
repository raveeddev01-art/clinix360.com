import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { Avatar } from "common/components";
import MessageCommentGroup from "../MessageCommentGroup";

@inject("usersStore", "messageStore", "groupsStore")
@observer
class MessageCommentInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: ""
    };
  }

  addComment = e => {
    const { commentText } = this.state;
    e.preventDefault();

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
    const { message, usersStore } = this.props;
    const user = usersStore.usersById[currentUser.id];

    return (
      <form className="file-comment" onSubmit={this.addComment}>
        <Avatar user={user} />
        <FormGroup className="file-comment__edit">
          <FormControl
            type="text"
            value={this.state.commentText}
            onChange={this.handleChange}
          />
          <div className="file-comment__edit-buttons file-comment__edit-buttons--add">
            <MessageCommentGroup
              message={message}
              label="Commenting in"
              showClose={false}
            />
            <Button type="submit" bsStyle="primary">
              Reply
            </Button>
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
