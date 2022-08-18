import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Button from "react-bootstrap/lib/Button";
import { Groups } from "common/components";
import { getGroupUrl } from "lib/utils";
import history from "lib/history";

@inject("messageStore", "groupsStore", "presenceStore")
@observer
class MessageShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageText: "",
      groupId: undefined
    };
  }

  setMessageText = () => {
    this.setState({ messageText: this.props.messageStore.messageInSharing.text_content });
  }

  onChangeGroup = groupId => this.setState({ groupId });

  onChangeComment = e => this.setState({ messageText: e.target.value });

  closeModal = () => {
    this.setState({ groupId: undefined, messageText: "" });
    this.props.messageStore.messageShareModalId = null;
  };

  share = () => {
    const { groupsStore, messageStore } = this.props;
    const { groupId, messageText } = this.state;

    messageStore.share(groupId, messageText).then(() => {
      this.closeModal();
      const group = groupsStore.getGroupById(groupId, messageText);

      if (group) {
        history.push(getGroupUrl(group));
      }
    });
  };

  render() {
    const { messageStore } = this.props;
    const show = !!messageStore.messageShareModalId;
    const { groupId, messageText } = this.state;

    return (
      <Modal className="file-share-modal" show={show} onHide={this.closeModal} onEntered={this.setMessageText} >
        <Modal.Header>
          <Modal.Title>Share Message</Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>Room or People to Share Message</ControlLabel>
            <Groups
              value={groupId}
              multi={false}
              onChange={this.onChangeGroup}
            />
          </FormGroup>

          <div className="file-comment">
            <FormGroup className="file-share-comment">
              <ControlLabel>Text (optional)</ControlLabel>
              <FormControl
                value={messageText}
                type="text"
                bsSize="lg"
                onChange={this.onChangeComment}
              />
              <div className="file-comment__edit-buttons margin">
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

export default MessageShareModal;
