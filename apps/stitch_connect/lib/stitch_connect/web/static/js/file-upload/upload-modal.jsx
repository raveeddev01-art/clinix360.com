import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import Col from "react-bootstrap/lib/Col";

@inject("uploadStore")
@observer
export default class UploadModal extends Component {
  uploadFile = () => {
    this.props.uploadStore.uploadFile();
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
          </FormGroup>
          <FormGroup bsSize="large">
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
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.toggleModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.uploadFile}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
