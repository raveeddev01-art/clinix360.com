import React, { Component } from "react";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import Select from "react-select";

import sidemenuStore from "../../sidemenu_store";

export default class CreateGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredGroups: [],
      filter: ""
    };
  }

  handleChange = (event) => {
  }
  
  render() {
    return (
      <Modal
        className="sidemenu-modal"
        show={this.props.showModal}
      >
        <Modal.Header>
          <Modal.Title>Create Group</Modal.Title>
          <a href="#" onClick={this.props.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <h5>
            Groups are where your team communicates. They’re best when
            organized around a topic — Radiology, for example.
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
                <HelpBlock className="text-muted m-b-0">
                  Public groups can be joined by anyone in your team.
                </HelpBlock>
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={3}>
                Name
              </Col>

              <Col sm={9}>
                <FormControl
                  name="name"
                  type="text"
                  placeholder="e.g. Radiology"
                  onChange={this.handleChange}
                />
                <HelpBlock className="text-muted m-b-0">
                  A standardize name will also be automatically created for
                  use in <a href="#">referencing</a> this group:{" "}
                  <span>#radiology</span>
                </HelpBlock>
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={3}>
                Description
              </Col>

              <Col sm={9}>
                <FormControl
                  name="description"
                  type="text"
                  onChange={this.handleChange}
                />
                <HelpBlock className="text-muted m-b-0">
                  What will this group be about?
                </HelpBlock>
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={3}>
                Members
              </Col>

              <Col sm={9}>
                <FormControl
                  name="members"
                  type="text"
                  placeholder="Type a name or email to add collegues"
                  onChange={this.handleChange}
                />
                <HelpBlock className="text-muted m-b-0">
                  Click to select team members to invite to your group. Don't
                  worry, you can always invite more.
                </HelpBlock>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button bsSize="large" onClick={this.props.toggleModal}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.props.toggleModal}
          >
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
