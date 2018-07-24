import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import VisibilitySensor from "react-visibility-sensor";

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
import UserComposeModal from "./modals/user_compose_modal";
import PatientComposeModal from "./modals/patient_compose_modal";
import AddPatientModal from "./modals/add_patient_modal";

@inject("inboxStore")
@observer
class InboxMenu extends Component {
  componentWillMount() {
    const intialFilter = this.props.asPatient ? null : "open";
    this.props.inboxStore.setCurrentInboxFilter(intialFilter);
  }

  onSearch = event => {
    event.preventDefault();
  };

  onBottomVisibilityChange = isVisible => {
    const {
      fullyLoadedForCurrentFilter,
      isLoadingConversationPage
    } = this.props.inboxStore;

    if (
      isVisible &&
      !fullyLoadedForCurrentFilter &&
      !isLoadingConversationPage
    ) {
      this.props.inboxStore.loadNextConversationPage();
    }
  };

  onComposeClick = () => {
    if (this.props.asPatient) {
      this.showPatientComposeModal();
    } else {
      this.showComposeModal();
    }
  };

  get currentModal() {
    return this.props.inboxStore.currentModal;
  }

  get isShowing() {
    return (
      this.currentModal === "compose" ||
      this.currentModal === "add" ||
      this.currentModal === "patientCompose"
    );
  }

  showPatientComposeModal = () => {
    this.props.inboxStore.setModal("patientCompose");
  };

  showComposeModal = () => {
    this.props.inboxStore.setModal("compose");
  };

  showAddPatientModal = () => {
    this.props.inboxStore.setModal("add");
  };

  closeModal = () => {
    this.props.inboxStore.closeModal();
  };

  changeFilter = newFilter => () => {
    this.props.inboxStore.setCurrentInboxFilter(newFilter);
  };

  renderLoading = () => {
    const showSpinner = this.props.inboxStore.isLoadingConversationPage;

    return (
      <VisibilitySensor onChange={this.onBottomVisibilityChange}>
        <div>
          {showSpinner && (
            <div className="inbox-loading-conversations">
              {" "}
              Loading Conversations...{" "}
            </div>
          )}
        </div>
      </VisibilitySensor>
    );
  };

  renderModalBody = () => {
    if (this.currentModal === "patientCompose") {
      return <PatientComposeModal closeModal={this.closeModal} />;
    }
    if (this.currentModal === "compose") {
      return (
        <UserComposeModal
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

  renderPatientOptions() {
    return <div className="header-separator" />;
  }

  renderProviderOptions() {
    const { inboxStore } = this.props;

    const dropdownTitle =
      inboxStore.currentInboxFilter === "open" ? (
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
      <Nav bsStyle="tabs" className="status-filter">
        <NavDropdown eventKey="1" title={dropdownTitle}>
          <MenuItem eventKey="1.1" onClick={this.changeFilter("open")}>
            <i className="fa fa-inbox" /> Open ({
              inboxStore.currentInbox.open_conversations_count
            }) <i className="fa fa-check pull-right" />
          </MenuItem>
          <MenuItem eventKey="1.2" onClick={this.changeFilter("closed")}>
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
    );
  }

  renderList = (conversations, emptyText) => {
    const scrollbarClass = this.props.asPatient
      ? "patient-scrollbar"
      : "provider-scrollbar";

    return (
      <Scrollbar
        className={scrollbarClass}
        viewRef={ref => {
          this.scrollbar = ref;
        }}
      >
        <div className="menu-nav m-b-20">
          {conversations[0] ? (
            conversations.map((conversation, index) => (
              <Conversation
                asPatient={this.props.asPatient}
                key={`conversation_${index}`}
                conversation={conversation}
              />
            ))
          ) : (
            <div className="empty-inbox">
              <h3>{this.props.loaded && emptyText}</h3>
            </div>
          )}
          {this.renderLoading()}
        </div>
      </Scrollbar>
    );
  };

  renderPatientConversationList() {
    const { inboxStore } = this.props;
    return this.renderList(inboxStore.sortedConversations, "No Conversations");
  }

  renderProviderConversationLists() {
    const { inboxStore } = this.props;

    return (
      <Tab.Content animation={false} unmountOnExit>
        <Tab.Pane eventKey="1.1">
          {this.renderList(
            inboxStore.openedConversations,
            "No Open Conversations"
          )}
        </Tab.Pane>

        <Tab.Pane eventKey="1.2">
          {this.renderList(
            inboxStore.closedConversations,
            "No Closed Conversations"
          )}
        </Tab.Pane>
      </Tab.Content>
    );
  }

  render() {
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
              {this.props.asPatient
                ? this.renderPatientOptions()
                : this.renderProviderOptions()}

              {this.props.asPatient
                ? this.renderPatientConversationList()
                : this.renderProviderConversationLists()}
            </div>
          </Tab.Container>
        </div>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

InboxMenu.defaultProps = {
  asPatient: false,
  loaded: true
};

InboxMenu.propTypes = {
  asPatient: PropTypes.bool,
  loaded: PropTypes.bool
};

export default withRouter(InboxMenu);
