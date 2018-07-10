import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import { Avatar } from "common/components";
import FileCommentGroup from "../FileCommentGroup";

@inject("usersStore", "teamFileStore", "groupsStore")
@observer
class FileCommentInput extends Component {
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

    this.props.teamFileStore
      .addComment(commentText)
      .then(() => this.setState({ commentText: "" }));
  };

  handleChange = e => {
    this.setState({ commentText: e.target.value });
  };

  render() {
    const { file } = this.props;

    return (
      <form className="file-comment" onSubmit={this.addComment}>
        <Avatar user={currentUser} />
        <FormGroup className="file-comment__edit">
          <FormControl
            type="text"
            value={this.state.commentText}
            onChange={this.handleChange}
          />
          <div className="file-comment__edit-buttons file-comment__edit-buttons--add">
            <FileCommentGroup
              file={file}
              label="Commenting in"
              showClose={false}
            />
            <Button type="submit" bsStyle="primary">
              Add Comment
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

FileCommentInput.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileCommentInput;
