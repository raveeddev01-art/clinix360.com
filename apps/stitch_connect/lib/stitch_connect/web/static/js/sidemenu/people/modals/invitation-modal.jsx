import React, { Component, PropTypes } from "react";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

class InvitationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show });
    }
  }

  render() {
    return (
      <Modal className="sidemenu-modal" show={this.state.show}>
        <Modal.Header>
          <Modal.Title>Invite People</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <h5>
            New team members will automatically join <strong>general</strong>.
            Enter invitations to email out.
          </h5>
          <Form horizontal className="invite-forms">
            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>

              <Col sm={9}>
                <FormControl
                  name="name"
                  type="text"
                  placeholder="name@example.com"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>

              <Col sm={9}>
                <FormControl
                  name="name"
                  type="text"
                  placeholder="name@example.com"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>

              <Col sm={9}>
                <FormControl
                  name="name"
                  type="text"
                  placeholder="name@example.com"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
          </Form>

          <Row>
            <Col sm={9} smOffset={2}>
              <a role="link" className="btn btn-block btn-default add-invite">
                Add Invitation
              </a>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.props.toggle}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.props.toggle}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

InvitationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

InvitationModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default InvitationModal;
