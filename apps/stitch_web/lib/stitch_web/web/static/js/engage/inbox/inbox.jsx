import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Modal from "react-bootstrap/lib/Modal";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Scrollbar from "common/components/scrollbar";

import Room from "./room";
import ComposeModal from "./modals/compose_modal";
import AddPatientModal from "./modals/add_patient_modal";

@inject("inboxStore")
@observer
class InboxMenu extends Component {
  constructor(props) {
    super(props);
    this.state = { roomName: "" };
  }

  onComposeClick = () => {
    this.showComposeModal();
  };

  get currentModal() {
    return this.props.inboxStore.currentModal;
  }

  get isShowing() {
    return this.currentModal === "compose" || this.currentModal === "add";
  }

  showComposeModal = () => {
    this.props.inboxStore.setModal("compose");
  };

  showAddPatientModal = () => {
    this.props.inboxStore.setModal("add");
  };

  closeModal = () => {
    this.props.inboxStore.closeModal();
  };

  renderModalBody = () => {
    if (this.currentModal === "compose") {
      return (
        <ComposeModal
          roomName={this.state.roomName}
          showAddPatientModal={this.showAddPatientModal}
          closeModal={this.closeModal}
        />
      );
    }
    return (
      <AddPatientModal
        key={this.currentModal}
        currentModal={this.currentModal}
        closeModal={this.closeModal}
      />
    );
  };

  renderModal = () => {
    return (
      <Modal className="inbox-modal" show onHide={this.closeModal}>
        {this.renderModalBody()}
      </Modal>
    );
  };

  render() {
    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <Form>
            <i className="fa fa-search" />
            <FormControl type="email" placeholder="Search" />
          </Form>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="compose-message">Compose Message</Tooltip>}
          >
            <Button onClick={this.onComposeClick}>
              <i className="fa fa-pencil-square-o" />
            </Button>
          </OverlayTrigger>
        </div>

        <div className="flex-content">
          <div className="status-filter">
            <a href="#" className="active">
              Open (9)
            </a>
            <a href="#">Closed (1029)</a>
          </div>

          <Scrollbar
            className="scrollbar"
            viewRef={ref => {
              this.scrollbar = ref;
            }}
          >
            <div className="menu-nav m-b-20">
              <Room name="Marty McFly" />
              <Room unread name="Andrew Brynum" />
              <Room active name="Beatrice Betty" />
              <Room unread name="Charlie Chaplin" />
              <Room name="John Smith" />
              <Room name="Deidre Smith" />
              <Room unread name="Charlie Som" />
              <Room />

              <Room name="Marty McFly" />
              <Room unread name="Andrew Brynum" />
              <Room name="Beatrice Betty" />
              <Room unread name="Charlie Chaplin" />
              <Room name="John Smith" />
              <Room name="Deidre Smith" />
              <Room unread name="Charlie Som" />
              <Room />

              <Room name="Marty McFly" />
              <Room unread name="Andrew Brynum" />
              <Room name="Beatrice Betty" />
              <Room unread name="Charlie Chaplin" />
              <Room name="John Smith" />
              <Room name="Deidre Smith" />
              <Room unread name="Charlie Som" />
              <Room />
            </div>
          </Scrollbar>
        </div>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

export default withRouter(InboxMenu);
