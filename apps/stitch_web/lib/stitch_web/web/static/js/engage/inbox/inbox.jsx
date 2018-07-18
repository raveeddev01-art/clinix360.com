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
import NavDropdown from "react-bootstrap/lib/NavDropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import Scrollbar from "common/components/scrollbar";

import Conversation from "./conversation";
import ComposeModal from "./modals/compose_modal";
import AddPatientModal from "./modals/add_patient_modal";

@inject("inboxStore")
@observer
class InboxMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openConversations: true
    };
  }

  onSearch = event => {
    event.preventDefault();
  };

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

    const dropdownTitle = this.state.openConversations ? (
      <span>
        <i className="fa fa-inbox" /> Open ({
          inboxStore.currentInbox.open_conversations_count
        })
      </span>
    ) : (
      <span>
        <i className="fa fa-check-circle" /> Closed ({inboxStore.currentInbox.closed_conversations_count})
      </span>
    );

    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <h3>All Conversations</h3>

          <div className="flex-box">
            <Form className="flex-item" onSubmit={this.onSearch}>
              <i className="fa fa-search" />
              <FormControl type="text" placeholder="Search" />
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
        </div>

        <div className="flex-content">
          <Tab.Container id="conversations-tabs" defaultActiveKey="1.1">
            <div>
              <Nav bsStyle="tabs" className="status-filter">
                <NavDropdown eventKey="1" title={dropdownTitle}>
                  <MenuItem
                    eventKey="1.1"
                    onClick={() => this.setState({ openConversations: true })}
                  >
                    <i className="fa fa-inbox" /> Open ({inboxStore.currentInbox.open_conversations_count}){" "}
                    <i className="fa fa-check pull-right" />
                  </MenuItem>
                  <MenuItem
                    eventKey="1.2"
                    onClick={() => this.setState({ openConversations: false })}
                  >
                    <i className="fa fa-check-circle" /> Closed ({inboxStore.currentInbox.closed_conversations_count}){" "}
                    <i className="fa fa-check pull-right" />
                  </MenuItem>
                </NavDropdown>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-sort">Coming Soon!</Tooltip>}
                >
                  <NavItem className="sort-menu" disabled>
                    <i className="fa fa-sort" /> Sort <span className="caret" />
                  </NavItem>
                </OverlayTrigger>
              </Nav>

              <Tab.Content animation={false} unmountOnExit>
                <Tab.Pane eventKey="1.1">
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

                <Tab.Pane eventKey="1.2">
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
