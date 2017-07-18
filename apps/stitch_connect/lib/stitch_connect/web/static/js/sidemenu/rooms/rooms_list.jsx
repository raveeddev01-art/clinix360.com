import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import Room from "./room.jsx";
import sidemenuStore from "../sidemenu_store.js";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="create-new-group">Create new group</Tooltip>}
          >
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        {this.props.rooms.map(room => {
          return <Room key={`room-${room.id}`} room={room} />;
        })}

        <Modal
          className="sidemenu-modal"
          show={this.state.isOpen}
          onHide={this.toggleModal}
        >
          <Modal.Header>
            <Modal.Title>Create a group</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
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
                  Group Type
                </Col>

                <Col sm={9}>
                  <div className="switch-field">
                    <input
                      type="radio"
                      id="switch_left"
                      name="switch_2"
                      value="public"
                      onChange={this.handleChange}
                      checked
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
                  <p className="text-muted m-b-0">
                    Public groups can be joined by anyone in your team.
                  </p>
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
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary" onClick={this.toggleModal}>
              Create Group
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
