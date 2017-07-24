import React, { Component } from "react";
import { observer } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import sidemenuStore from "./sidemenu_store.js";

@observer
export default class Team extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleTeamModal = () => {
    this.setState({
      showTeamModal: !this.state.showTeamModal
    });
  };

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  render() {
    return (
      <div className="menu-nav people m-b-20">
        <div className="heading">
          <h5>
            <a href="#" onClick={this.toggleTeamModal}>
              {this.props.heading}
            </a>
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="open-a-direct-message">Invite People</Tooltip>
            }
          >
            <a href="#" onClick={this.toggleInviteModal}>
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        {sidemenuStore.instance.onlineUsers.map(user => {
          return (
            <a key={`online-user-${user.id}`} href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle" />
              </div>
              <div className="item-text">
                {user.fullname}
              </div>
            </a>
          );
        })}

        {sidemenuStore.instance.offlineUsers.map(user => {
          return (
            <a key={`offline-user-${user.id}`} href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle-o" />
              </div>
              <div className="item-text">
                {user.fullname}
              </div>
            </a>
          );
        })}

        <Modal className="sidemenu-modal" show={this.state.showTeamModal}>
          <Modal.Header>
            <Modal.Title>People</Modal.Title>
            <a href="#" onClick={this.toggleTeamModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <div className="modal-search">
              <FormControl
                type="text"
                value={this.state.value}
                placeholder="Search members"
                className="input-lg"
                onChange={this.handleChange}
              />
            </div>

            <h5 className="team-heading text-muted">
              Click to select team members to start chat with.
            </h5>

            <div className="team-list">
              {sidemenuStore.instance.onlineUsers.map(user => {
                return (
                  <div
                    key={`team-list-online-${user.id}`}
                    className="team-member"
                  >
                    <i className="fa fa-circle" /> {`${user.fullname} `}
                    <span className="text-muted">{user.username}</span>
                  </div>
                );
              })}

              {sidemenuStore.instance.offlineUsers.map(user => {
                return (
                  <div
                    key={`team-list-offline-${user.id}`}
                    className="team-member"
                  >
                    <i className="fa fa-circle-o" /> {`${user.fullname} `}
                    <span className="text-muted">{user.username}</span>
                  </div>
                );
              })}
            </div>
          </Modal.Body>
        </Modal>

        <Modal className="sidemenu-modal" show={this.state.showInviteModal}>
          <Modal.Header>
            <Modal.Title>Invite People</Modal.Title>
            <a href="#" onClick={this.toggleInviteModal}>
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
                <a href="#" className="btn btn-block btn-default add-invite">
                  Add Invitation
                </a>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleInviteModal}>
              Cancel
            </Button>
            <Button
              bsSize="large"
              bsStyle="primary"
              onClick={this.toggleInviteModal}
            >
              Send
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
