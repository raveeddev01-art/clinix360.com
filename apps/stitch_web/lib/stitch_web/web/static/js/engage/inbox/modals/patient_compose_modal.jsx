import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import ComposeModal from "./compose_modal";

@inject("inboxStore")
@observer
class PatientComposeModal extends Component {
  createConversation = state => {
    return this.props.inboxStore.createConversation({
      subject: state.subject,
      text_content: state.message
    });
  };

  render() {
    return (
      <ComposeModal
        asPatient
        createConversation={this.createConversation}
        closeModal={this.props.closeModal}
      />
    );
  }
}

PatientComposeModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default withRouter(PatientComposeModal);
