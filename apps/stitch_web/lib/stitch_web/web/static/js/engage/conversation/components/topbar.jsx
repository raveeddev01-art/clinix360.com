import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";

import AddPatientModal from "../../inbox/modals/add_patient_modal";

@inject("inboxStore")
@observer
class Topbar extends Component {
  onCloseConversation = () => {
    const { inboxStore } = this.props;
    inboxStore.closeConversation(inboxStore.currentConversation.id);
  };

  onToggle = isOpen => {
    if (isOpen) {
      this.overlayTrigger.hide();
    }
  };

  showAddPatientModal = () => {
    this.props.inboxStore.setModal("add");
  };

  renderModal = () => {
    return (
      <Modal className="inbox-modal" show onHide={this.closeModal}>
        <AddPatientModal />
      </Modal>
    );
  };

  render() {
    const { inboxStore } = this.props;

    return (
      <div className="topbar">
        <div className="header-text">
          <h4>{inboxStore.currentConversation.patient.full_name}</h4>
          <div className="subject">
            {inboxStore.currentConversation.subject}
          </div>
        </div>

        <div className="header-nav">
          <a
            role="button"
            className="btn btn-default"
            onClick={this.onCloseConversation}
          >
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-info">Close Conversation</Tooltip>}
              ref={ref => {
                this.roomInfoOverlay = ref;
              }}
            >
              <i className="fa fa-check-circle" />
            </OverlayTrigger>
          </a>

          <Dropdown
            id="dropdown-group-controls"
            pullRight
            onToggle={this.onToggle}
          >
            <Dropdown.Toggle noCaret className="more-btn">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-more">More</Tooltip>}
                ref={ref => {
                  this.overlayTrigger = ref;
                }}
              >
                <i className="fa fa-ellipsis-v" />
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="more-menu">
              <MenuItem onSelect={this.showAddPatientModal}>
                <i className="fa fa-user m-r-5" /> Add Patient
              </MenuItem>
              <MenuItem
                id="intercom-link"
                href="jig8cj9z@inbound.intercom-mail.com"
              >
                <i className="fa fa-bullhorn m-r-5" /> Live Support
              </MenuItem>
              <MenuItem
                target="_blank"
                rel="noopener noreferrer"
                href="https://help.teamstitch.com"
              >
                <i className="fa fa-question-circle m-r-5" /> Help Center
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default Topbar;
