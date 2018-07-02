import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { FormGroup, FormControl, Button, Col } from "react-bootstrap";

@inject("usersStore", "teamFileStore", "titleStore", "groupsStore")
@observer
class FileCommentInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: ""
    };
  }

  componentWillMount() {}

  addComment() {
    this.props.teamFileStore
      .addComment(this.state.commentText)
      .then(e => this.setState({ commentText: "" }));
  }

  handleChange(e) {
    this.setState({ commentText: e.target.value });
  }

  commentingIn(groups) {
    if (groups.length === 0) {
      return <span />;
    }
    return (
      <span>
        Commenting in
        {groups.map(group => (
          <span key={group.id}>
            <a href={`/rooms/${group.slug}`}>
              {group.public ? "#" : "(Private) "}
              {group.slug}
            </a>
          </span>
        ))}
      </span>
    );
  }

  render() {
    const file = this.props.file;
    const groups = this.props.groupsStore.groups.filter(
      group =>
        group.type !== "dm" &&
        group.type !== "multi_dm" &&
        file.shared_in.includes(group.id)
    );

    return (
      <Col md={6}>
        <div className="avatar">
          <img
            alt={currentUser.full_name}
            className="img-circle"
            src={currentUser.avatar_thumb}
            style={{ width: "20px", height: "20px" }}
          />
        </div>
        <FormGroup controlId="file-comment">
          <FormControl
            componentClass="textarea"
            placeholder="textarea"
            value={this.state.commentText}
            onChange={e => this.handleChange(e)}
          />
        </FormGroup>
        <Button bsStyle="success" onClick={_ => this.addComment()}>
          {"Add Comment"}
        </Button>
        {this.commentingIn(groups)}
      </Col>
    );
  }
}

FileCommentInput.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileCommentInput;
