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

export default class NavItemConvert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Convert
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Convert Group</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>Public groups can be discovered and joined by anyone.</h5>
            <h5>
              Private groups can be accessed only by the creator and users who
              are invited in.
            </h5>
            <Form horizontal>
              <FormGroup>
                <Col componentClass={ControlLabel} sm={3}>
                  Type
                </Col>

                <Col sm={9}>
                  <div className="switch-field">
                    <input
                      type="radio"
                      id="switch_left"
                      name="switch_2"
                      value="public"
                      onChange={this.handleChange}
                      defaultChecked
                    />
                    <label htmlFor="switch_left">
                      <i className="fa fa-comments" /> Public
                    </label>
                    <input
                      type="radio"
                      id="switch_right"
                      name="switch_2"
                      value="private"
                      onChange={this.handleChange}
                    />
                    <label htmlFor="switch_right">
                      <i className="fa fa-lock" /> Private
                    </label>
                  </div>
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
