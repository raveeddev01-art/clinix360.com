import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Groups from "../common/components/groups/groups";

@inject("uploadStore")
@observer
export default class UploadModal extends Component {
  onChangeGroup = groupId => {
    this.props.uploadStore.changeUploadGroup(groupId);
  };

  uploadFile = () => {
    const { uploadStore } = this.props;
    if (!uploadStore.groupId) {
      notify.show("Please select a group to upload file.", "error");
      return;
    }

    uploadStore.uploadFile();
    this.toggleModal();
  };

  toggleModal = () => {
    const { uploadStore } = this.props;
    uploadStore.isUploadModalVisible = false;
  };

  handleChange = fieldName => evt => {
    this.props.uploadStore[fieldName] = evt.target.value;
  };

  render() {
    const { uploadStore } = this.props;
    const show = uploadStore.isUploadModalVisible;
    return (
      <Modal className="sidemenu-modal upload-modal" show={show}>
        <Modal.Header>
          <Modal.Title>File</Modal.Title>
          <a role="link" onClick={this.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <FormGroup bsSize="large">
            <Row>
              <Col componentClass={ControlLabel} sm={3}>
                Title
              </Col>

              <Col sm={9}>
                <FormControl
                  name="title"
                  type="text"
                  value={uploadStore.title}
                  onChange={this.handleChange("title")}
                />
                <HelpBlock>
                  Use a descriptive title so you can search for it later
                </HelpBlock>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup bsSize="large">
            <Row>
              <Col componentClass={ControlLabel} sm={3}>
                Comment
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
          <FormGroup bsSize="large">
            <Row>
              <Col componentClass={ControlLabel} sm={3}>
                Group
              </Col>
              <Col sm={9}>
                <Groups
                  value={uploadStore.groupId}
                  onChange={this.onChangeGroup}
                />
              </Col>
            </Row>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.toggleModal}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.uploadFile}
            disabled={!uploadStore.groupId || !uploadStore.title}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
