import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Button from "react-bootstrap/lib/Button";
import { Groups } from "common/components";

@inject("teamFileStore", "groupsStore", "presenceStore")
@observer
class FileShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: "",
      groupId: undefined
    };
  }

  onChangeGroup = groupId => this.setState({ groupId });

  onChangeComment = e => this.setState({ commentText: e.target.value });

  closeModal = () => {
    this.props.teamFileStore.fileShareModalId = null;
  };

  share = () => {
    const { teamFileStore, groupsStore } = this.props;
    const { groupId, commentText } = this.state;

    teamFileStore.share(groupId, commentText).then(() => {
      this.closeModal();
      const group = groupsStore.getGroupById(groupId);

      if (group) {
        groupsStore.openGroup(group.slug);
      }
    });
  };

  render() {
    const { teamFileStore } = this.props;
    const show = !!teamFileStore.fileShareModalId;
    const { groupId, commentText } = this.state;

    return (
      <Modal className="file-share-modal" show={show} onHide={this.closeModal}>
        <Modal.Header>
          <Modal.Title>Share File</Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>Room or People to Share File</ControlLabel>
            <Groups
              value={groupId}
              multi={false}
              onChange={this.onChangeGroup}
            />
          </FormGroup>

          <div className="file-comment">
            <FormGroup className="file-comment__edit">
              <ControlLabel>Add Comment (optional)</ControlLabel>
              <FormControl
                componentClass="textarea"
                placeholder="Comment goes here..."
                value={commentText}
                rows={4}
                onChange={this.onChangeComment}
              />
              <div className="file-comment__edit-buttons">
                <Button bsStyle="default" onClick={this.closeModal}>
                  Cancel
                </Button>

                <Button bsStyle="primary" onClick={this.share}>
                  Share
                </Button>
              </div>
            </FormGroup>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default FileShareModal;
