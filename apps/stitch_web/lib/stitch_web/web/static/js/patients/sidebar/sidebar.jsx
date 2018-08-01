import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import VisibilitySensor from "react-visibility-sensor";

import Scrollbar from "common/components/scrollbar";
import Patient from "./patient";
import AddPatientModal from "../../engage/inbox/modals/add_patient_modal";

const suppressSubmit = e => {
  e.preventDefault();
};

@inject("patientsStore")
@observer
class Sidebar extends Component {
  onPatientModalClick = () => {
    this.showAddPatientModal();
  };

  onBottomVisibilityChange = isVisible => {
    const { allPatientsLoaded, isLoadingPage } = this.props.patientsStore;

    if (isVisible && !allPatientsLoaded && !isLoadingPage) {
      this.props.patientsStore.loadNextPatientPage();
    }
  };

  get currentModal() {
    return this.props.patientsStore.currentModal;
  }

  get isShowing() {
    return this.currentModal === "add";
  }

  setFilter = e => {
    this.props.patientsStore.setSearchFilter(e.target.value);
  };

  clearFilter = () => {
    this.props.patientsStore.setSearchFilter("");
  };

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

  renderLoading = () => {
    const showLoading = this.props.patientsStore.isLoadingPage;
    const visibilityKey = this.props.patientsStore.patients.length;

    return (
      <VisibilitySensor
        key={visibilityKey}
        onChange={this.onBottomVisibilityChange}
      >
        <div>
          {showLoading && (
            <div className="loading-patients"> Loading Patients... </div>
          )}
        </div>
      </VisibilitySensor>
    );
  };

  render() {
    const { patientsStore } = this.props;
    const { searchFilter } = patientsStore;

    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <h3>All Patients</h3>

          <div className="flex-box">
            <Form className="flex-item" onSubmit={suppressSubmit}>
              <i className="fa fa-search" />
              <FormControl
                type="text"
                placeholder="Search"
                value={searchFilter}
                onChange={this.setFilter}
              />
              {searchFilter && (
                <a tabIndex="0" role="link" onClick={this.clearFilter}>
                  <i className="fa fa-times-circle-o" />
                </a>
              )}
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

        <Scrollbar
          className="scrollbar"
          viewRef={ref => {
            this.scrollbar = ref;
          }}
        >
          <div className="flex-content">
            <ul className="list-unstyled patients-list">
              {patientsStore.patientsForPage.map((patient, i) => (
                <Patient key={`patient_${i}`} patient={patient} />
              ))}
              {this.renderLoading()}
            </ul>
          </div>
        </Scrollbar>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

export default withRouter(Sidebar);
