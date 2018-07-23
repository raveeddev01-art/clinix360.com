import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Patient from "./patient";
import AddPatientModal from "../../engage/inbox/modals/add_patient_modal";

@inject("patientsStore")
@observer
class Sidebar extends Component {
  onSearch = event => {
    event.preventDefault();
  };

  onPatientModalClick = () => {
    this.showAddPatientModal();
  };

  get currentModal() {
    return this.props.patientsStore.currentModal;
  }

  get isShowing() {
    return this.currentModal === "add";
  }

  showAddPatientModal = () => {
    this.props.patientsStore.setModal("add");
  };

  closeModal = () => {
    this.props.patientsStore.closeModal();
  };

  renderModal = () => {
    return (
      <Modal className="inbox-modal" show onHide={this.closeModal}>
        <AddPatientModal closeModal={this.closeModal} />
      </Modal>
    );
  };

  render() {
    const { patientsStore } = this.props;

    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <h3>All Patients</h3>

          <div className="flex-box">
            <Form className="flex-item" onSubmit={this.onSearch}>
              <i className="fa fa-search" />
              <FormControl type="text" placeholder="Search" />
            </Form>

            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="add-patient">Add Patient</Tooltip>}
            >
              <Button onClick={this.onPatientModalClick}>
                <i className="fa fa-plus" />
              </Button>
            </OverlayTrigger>
          </div>
        </div>

        <div className="flex-content">
          <ul className="list-unstyled patients-list">
            {patientsStore.patientsForPage.map((patient, i) => (
              <Patient key={`patient_${i}`} patient={patient} />
            ))}
          </ul>
        </div>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

export default withRouter(Sidebar);
