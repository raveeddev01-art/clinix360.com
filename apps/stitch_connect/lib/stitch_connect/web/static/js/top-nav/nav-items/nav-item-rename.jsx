import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class NavItemRename extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: "",
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Rename
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Rename Group</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <Form horizontal>
              <FormGroup bsSize="large">
                <Col componentClass={ControlLabel} sm={3}>
                  Group Name:
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="groupName"
                    type="text"
                    autoFocus
                    placeholder="General"
                    onChange={this.handleChange}
                  />
                  <HelpBlock className="text-muted m-b-0">
                    The standardize name for use in <a href="#">referencing</a>{" "}
                    this group will not change.
                  </HelpBlock>
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Rename
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
