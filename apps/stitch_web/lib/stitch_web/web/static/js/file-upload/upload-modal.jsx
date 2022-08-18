import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import { Groups } from "common/components";

@inject("uploadStore")
@observer
export default class UploadModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileUploaded: false
    };
  }

  onChangeGroup = groupId => {
    this.props.uploadStore.changeUploadGroup(groupId);
  };

  onSubmit = evt => {
    evt.preventDefault();
    evt.stopPropagation();

    const text = this.props.uploadStore.files > 1 ? "files" : "file";

    if (!this.state.fileUploaded && navigator.onLine){
      this.setState({ fileUploaded: true });
      this.uploadFile();
    } else {
      notify.show(`No Connection. Unable to upload ${text}.`, "error");
    }
  };

  uploadFile = () => {
    const { uploadStore } = this.props;
    if (uploadStore.from === "engage") {
      if (!uploadStore.conversationId) {
        notify.show("No engage conversation is selected.", "error");
        return;
      }

      uploadStore.uploadFiles(
        `/conversations/${uploadStore.conversationId}/messages`
      );
    } else {
      if (!uploadStore.groupId) {
        notify.show("Please select a room to upload file.", "error");
        return;
      } else if (uploadStore.commentUpload) {
        uploadStore.uploadFiles(`/messages/${uploadStore.messageId}/comments`);
      } else {
        uploadStore.uploadFiles(`/groups/${uploadStore.groupId}/messages`)
      }

    }

    this.toggleModal();
  };

  toggleModal = () => {
    const { uploadStore } = this.props;
    uploadStore.isUploadModalVisible = false;
    setTimeout(
      () => this.setState({ fileUploaded: false }), 
      3000
    );
  };

  handleChange = fieldName => evt => {
    this.props.uploadStore[fieldName] = evt.target.value;
  };

  render() {
    const { uploadStore } = this.props;
    const show = uploadStore.isUploadModalVisible;

    const uploadClassName = cx("sidemenu-modal", "upload-modal", {
      "engage-upload-modal": uploadStore.from === "engage"
    });
    return (
      <Modal className={uploadClassName} show={show} onHide={this.toggleModal}>
        <Modal.Header>
          <Modal.Title>File</Modal.Title>
          <a role="link" onClick={this.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={this.onSubmit}>
            <FormGroup bsSize="large">
              <Row>
                <Col componentClass={ControlLabel} sm={3}>
                  Title
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="title"
                    type="text"
                    autoFocus
                    value={uploadStore.title}
                    onChange={this.handleChange("title")}
                  />
                  <HelpBlock>
                    Use a descriptive title so you can search for it later
                  </HelpBlock>
                </Col>
              </Row>
            </FormGroup>
            {uploadStore.from !== "engage" && (
              <FormGroup bsSize="large">
                <Row>
                  <Col componentClass={ControlLabel} sm={3}>
                    Message
                    <br />
                    <small>(optional)</small>
                  </Col>

                  <Col sm={9}>
                    <FormControl
                      as="textarea"
                      name="description"
                      value={uploadStore.description}
                      onChange={this.handleChange("description")}
                    />
                    <HelpBlock>
                      Comments will be added following the file upload
                    </HelpBlock>
                  </Col>
                </Row>
              </FormGroup>
            )}
            {uploadStore.from === "connect" && (
              <FormGroup bsSize="large">
                <Row>
                  <Col componentClass={ControlLabel} sm={3}>
                    Room
                  </Col>
                  <Col sm={9}>
                    <Groups
                      value={uploadStore.groupId}
                      onChange={this.onChangeGroup}
                    />
                  </Col>
                </Row>
              </FormGroup>
            )}
            <Row>
              <Col sm={12} className="text-right">
                <Button bsSize="large" type="button" onClick={this.toggleModal}>
                  Cancel
                </Button>&nbsp;
                <Button
                  bsSize="large"
                  bsStyle="primary"
                  type="submit"
                  disabled={!uploadStore.title}
                >
                  Upload
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}
