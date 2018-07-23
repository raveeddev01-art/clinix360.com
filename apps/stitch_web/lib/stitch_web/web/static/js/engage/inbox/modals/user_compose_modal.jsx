import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import ComposeModal from "./compose_modal";

@inject("inboxStore")
@observer
class UserComposeModal extends Component {
  createConversation = state => {
    return this.props.inboxStore.createConversation({
      patient_id: state.patient.id,
      subject: state.subject,
      text_content: state.message
    });
  };

  render() {
    return (
      <ComposeModal
        createConversation={this.createConversation}
        closeModal={this.props.closeModal}
        showAddPatientModal={this.props.showAddPatientModal}
      />
    );
  }
}

UserComposeModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  showAddPatientModal: PropTypes.func.isRequired
};

export default withRouter(UserComposeModal);
