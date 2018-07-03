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

  addComment = () => {
    this.props.teamFileStore
      .addComment(this.state.commentText)
      .then(() => this.setState({ commentText: "" }));
  };

  handleChange = e => {
    this.setState({ commentText: e.target.value });
  };

  render() {
    const { file } = this.props;

    return (
      <div className="file-comment">
        <Avatar user={currentUser} />
        <FormGroup className="file-comment__edit">
          <FormControl
            componentClass="textarea"
            placeholder="Comment goes here..."
            rows={3}
            value={this.state.commentText}
            onChange={this.handleChange}
          />
          <div className="file-comment__edit-buttons file-comment__edit-buttons--add">
            <FileCommentGroup file={file} />
            <Button bsStyle="primary" onClick={this.addComment}>
              Add Comment
            </Button>
          </div>
        </FormGroup>
      </div>
    );
  }
}

FileCommentInput.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileCommentInput;
