import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import pick from "lodash/pick";
import moment from "moment";

import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";

import Scrollbar from "common/components/scrollbar";
import ComposeModal from "./modals/compose-modal";
import NoteModal from "./modals/note-modal";

import FirstName from "./profile/first-name";
import LastName from "./profile/last-name";
import Mrn from "./profile/mrn";
import Email from "./profile/email";
import Phone from "./profile/phone";

@inject("patientsStore")
@observer
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  onSuccess = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "success"
    });
  };

  onError = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "danger"
    });
  };

  onComposeModalClick = () => {
    this.props.patientsStore.setModal("compose");
  };

  onNoteModalClick = event => {
    event.preventDefault();
    // Hide Note modal until backend is available
    // this.props.patientsStore.setModal("note");
  };

  get currentModal() {
    return this.props.patientsStore.currentModal;
  }

  get isShowing() {
    return this.currentModal === "compose" || this.currentModal === "note";
  }

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  closeModal = () => {
    this.props.patientsStore.closeModal();
  };

  renderModalBody = () => {
    const { patientsStore: { currentPatient } } = this.props;

    if (this.currentModal === "note") {
      return (
        <NoteModal closeModal={this.closeModal} patient={currentPatient} />
      );
    }

    return (
      <ComposeModal closeModal={this.closeModal} patient={currentPatient} />
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
    const { alertMessage, alertVisible, alertStyle } = this.state;
    const inputFieldProps = pick(this, "onSuccess", "onError", "hideAlert");

    const { patientsStore: { currentPatient } } = this.props;

    return (
      <div className="info-panel">
        <Scrollbar
          className="scrollbar"
          viewRef={ref => {
            this.scrollbar = ref;
          }}
        >
          <h1>
            {currentPatient.first_name} {currentPatient.last_name}
          </h1>

          <h4>Profile</h4>
          <div className="card">
            {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
            <FirstName {...inputFieldProps} />
            <LastName {...inputFieldProps} />
            <Mrn {...inputFieldProps} />
            <Email {...inputFieldProps} />
            <Phone {...inputFieldProps} />
          </div>

          <h4>Timeline</h4>
          <div className="card">
            <div className="timeline">
              <div className="item">
                <div className="dot-holder">
                  <div className="dot">
                    <i className="fa fa-plus" />
                  </div>
                </div>

                <div className="description">
                  <Button onClick={this.onComposeModalClick}>
                    Send Message
                  </Button>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
                    ref={ref => {
                      this.tooltipOverlay = ref;
                    }}
                  >
                    <Button onClick={this.onNoteModalClick}>Add Note</Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
                    ref={ref => {
                      this.tooltipOverlay = ref;
                    }}
                  >
                    <Button onClick={this.onNoteModalClick}>Create Task</Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
                    ref={ref => {
                      this.tooltipOverlay = ref;
                    }}
                  >
                    <Button onClick={this.onNoteModalClick}>Upload File</Button>
                  </OverlayTrigger>
                </div>
              </div>

              <div className="item">
                <div className="dot-holder">
                  <div className="dot" />
                </div>

                <div className="description">
                  <div className="icon">
                    <i className="fa fa-bullhorn" />
                  </div>

                  <div className="content">
                    <div className="action">Conversation started</div>
                    <div className="text-muted">Started on May 30, 2018</div>
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="dot-holder">
                  <div className="dot" />
                </div>

                <div className="description">
                  <div className="icon">
                    <i className="fa fa-user-plus" />
                  </div>

                  <div className="content">
                    <div className="action">Account created</div>
                    <div className="text-muted">
                      Created on{" "}
                      {moment
                        .utc(currentPatient.inserted_at)
                        .local()
                        .format("MMMM D, YYYY")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Scrollbar>

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

export default Main;
