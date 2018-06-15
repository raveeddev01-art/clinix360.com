import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Modal from "react-bootstrap/lib/Modal";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Tab from "react-bootstrap/lib/Tab";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";

import Scrollbar from "common/components/scrollbar";

import Room from "./room";
import ComposeModal from "./modals/compose_modal";
import AddPatientModal from "./modals/add_patient_modal";

@inject("inboxStore")
@observer
class InboxMenu extends Component {
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
          <Tab.Container id="conversations-tabs" defaultActiveKey="first">
            <div>
              <Nav justified className="status-filter">
                <NavItem eventKey="first">Open (16)</NavItem>
                <NavItem eventKey="second">Closed (5)</NavItem>
              </Nav>

              <Tab.Content animation={false}>
                <Tab.Pane eventKey="first">
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
                    </div>
                  </Scrollbar>
                </Tab.Pane>

                <Tab.Pane eventKey="second">
                  <Scrollbar
                    className="scrollbar"
                    viewRef={ref => {
                      this.scrollbar = ref;
                    }}
                  >
                    <div className="menu-nav m-b-20">
                      <Room name="Marty McFly" closed />
                      <Room name="Charlie Chaplin" closed />
                      <Room name="John Smith" closed />
                      <Room name="Deidre Smith" closed />
                      <Room name="Charlie Som" closed />
                    </div>
                  </Scrollbar>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </Tab.Container>
        </div>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

export default withRouter(InboxMenu);
