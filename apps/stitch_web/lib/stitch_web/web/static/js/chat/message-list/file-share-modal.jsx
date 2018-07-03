import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Typeahead } from "react-bootstrap-typeahead";
import Modal from "react-bootstrap/lib/Modal";
import { FormGroup, FormControl, Button, Col } from "react-bootstrap";
import history from "lib/history";

import _ from "lodash";
import FileCommentInput from "admin/files/components/FileCommentInput";
import FileCommentGroup from "admin/files/components/FileCommentGroup";

@inject("teamFileStore", "groupsStore", "presenceStore")
@observer
class FileShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: "",
      selectedGroup: undefined
    };
  }

  closeModal = () => {
    this.props.teamFileStore.fileShareModalId = null;
  };

  share = () => {
    const groupId = this.state.selectedGroup.id;
    this.props.teamFileStore.share(groupId).then(file => {
      this.closeModal();
      history.push(`/rooms/${this.state.selectedGroup.slug}`);
    });
  };

  onGroupSelect = group => {
    this.setState({ selectedGroup: group });
  };

  renderModalHeader() {
    return (
      <Modal.Header>
        <Modal.Title>Share File</Modal.Title>
        <a role="link" onClick={this.closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  // TODO: consider extracting this on groups load and making available by default
  userIdFromDM(group) {
    const userIds = group.slug.split(":")[1].split(".");
    const [id] = _.without(userIds, `${currentUser.id}`);
    return id;
  }

  renderGroupItem(group) {
    const online = isOnline =>
      isOnline ? (
        <i className="fa fa-circle" />
      ) : (
        <i className="fa fa-circle-o" />
      );

    if (group.type == "dm") {
      return (
        <span className="username">
          {online(this.props.presenceStore.isOnline(this.userIdFromDM(group)))}
          {group.name}
        </span>
      );
    }

    if (group.type == "multi_dm") {
      return <span className="username">{group.name}</span>;
    }

    if (group.public == false) {
      return <span className="username">(private) {group.name}</span>;
    }

    return <span className="username"># {group.name}</span>;
  }

  renderSharedInSelector() {
    const groups = this.props.groupsStore.groups;

    return (
      <Typeahead
        labelKey="name"
        multiple={false}
        options={groups}
        onChange={selected => {
          if (selected.length == 0) {
            return null;
          } else {
            this.onGroupSelect(selected[0]);
          }
        }}
        renderMenuItemChildren={group => (
          <div className=".user-list-item" key={group.id}>
            <div className="item-text" style={{ flexGrow: 1, display: "flex" }}>
              {this.renderGroupItem(group)}
            </div>
          </div>
        )}
        placeholder="Search rooms and people"
      />
    );
  }

  handleChange(e) {
    this.setState({ commentText: e.target.value });
  }

  renderCommentInput() {
    return (
      <Col md={6}>
        <FormGroup>
          <FormControl
            componentClass="textarea"
            placeholder="textarea"
            value={this.state.commentText}
            onChange={e => this.handleChange(e)}
          />
        </FormGroup>

        <FileCommentGroup file={this.props.teamFileStore.file} />

        <Button bsStyle="default" onClick={_ => this.closeModal()}>
          Cancel
        </Button>

        <Button bsStyle="success" onClick={_ => this.share()}>
          Share
        </Button>
      </Col>
    );
  }

  renderModalBody() {
    return (
      <Modal.Body>
        <div>
          {"Share file in"}
          {this.renderSharedInSelector()}
          {"Add comment (optional)"}
          {this.renderCommentInput()}
        </div>
      </Modal.Body>
    );
  }

  render() {
    const show = !!this.props.teamFileStore.fileShareModalId;
    if (!show) {
      return null;
    }

    return (
      <Modal className="message-info-modal" show onHide={this.closeModal}>
        {this.renderModalHeader()}
        {this.renderModalBody()}
      </Modal>
    );
  }
}
export default FileShareModal;
