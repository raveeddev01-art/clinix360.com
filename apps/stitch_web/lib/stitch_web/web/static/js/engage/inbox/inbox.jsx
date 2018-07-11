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
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";

import Scrollbar from "common/components/scrollbar";

import Conversation from "./conversation";
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
    const { inboxStore } = this.props;

    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="compose-message">Compose Message</Tooltip>}
          >
            <Button block onClick={this.onComposeClick}>
              <i className="fa fa-pencil-square-o" /> Compose
            </Button>
          </OverlayTrigger>
        </div>

        <div className="flex-content">
          <Tab.Container id="conversations-tabs" defaultActiveKey="first">
            <div>
              <Nav justified className="status-filter">
                <NavItem eventKey="first">
                  Open{" "}
                  {inboxStore.currentInbox.open_conversations_count > 0 && (
                    <span>
                      ({inboxStore.currentInbox.open_conversations_count})
                    </span>
                  )}
                </NavItem>
                <NavItem eventKey="second">
                  Closed{" "}
                  {inboxStore.currentInbox.closed_conversations_count > 0 && (
                    <span>
                      ({inboxStore.currentInbox.closed_conversations_count})
                    </span>
                  )}
                </NavItem>
              </Nav>

              <Tab.Content animation={false} unmountOnExit>
                <Tab.Pane eventKey="first">
                  <Scrollbar
                    className="scrollbar"
                    viewRef={ref => {
                      this.scrollbar = ref;
                    }}
                  >
                    <div className="menu-nav m-b-20">
                      {inboxStore.currentInbox.open_conversations_count > 0 ? (
                        inboxStore.openedConversations.map(
                          (conversation, index) => (
                            <Conversation
                              key={`conversation_${index}`}
                              conversation={conversation}
                            />
                          )
                        )
                      ) : (
                        <div className="empty-inbox">
                          <h3>No Open Conversations</h3>
                        </div>
                      )}
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
                    {inboxStore.currentInbox.closed_conversations_count > 0 ? (
                      <div className="menu-nav m-b-20">
                        {inboxStore.closedConversations.map(
                          (conversation, index) => (
                            <Conversation
                              key={`conversation_${index}`}
                              conversation={conversation}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <div className="empty-inbox">
                        <h3>No Closed Conversations</h3>
                      </div>
                    )}
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
