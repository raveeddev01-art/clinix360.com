import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";

@inject("inboxStore")
@observer
class NoteModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      title: "",
      note: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  createConversation = event => {
    const { closeModal } = this.props;
    event.preventDefault();
    closeModal();
  };

  renderModalHeader() {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Create Note</Modal.Title>
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderModalFooter() {
    const { closeModal } = this.props;

    return (
      <Modal.Footer>
        <Row>
          <Col sm={9} smOffset={3}>
            <div className="pull-right">
              <Button bsSize="large" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                bsSize="large"
                bsStyle="primary"
                onClick={this.createConversation}
                disabled={!this.state.title || !this.state.note}
              >
                Send
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Footer>
    );
  }

  renderModalBody() {
    const { title, note } = this.state;

    return (
      <Modal.Body>
        <Form horizontal>
          {!!this.state.error && (
            <Alert bsStyle="danger">{this.state.error}</Alert>
          )}
          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Title (optional)
            </Col>

            <Col sm={9}>
              <FormControl
                name="title"
                type="text"
                value={title}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Note
            </Col>

            <Col sm={9}>
              <FormControl
                name="note"
                type="text"
                rows="7"
                componentClass="textarea"
                value={note}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>
        </Form>
      </Modal.Body>
    );
  }

  render() {
    return (
      <div>
        {this.renderModalHeader()}
        {this.renderModalBody()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

NoteModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default NoteModal;
