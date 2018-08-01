import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import NamePanel from "../../common/components/name-panel/name-panel";

const title = "Name";
const description = "The name that appears to your provider";

@inject("currentPatientStore")
@observer
class PatientNamePanel extends Component {
  render() {
    const { firstName, lastName, saveName } = this.props.currentPatientStore;
    return (
      <NamePanel
        title={title}
        description={description}
        firstName={firstName}
        lastName={lastName}
        saveName={saveName}
        {...this.props}
      />
    );
  }
}

PatientNamePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PatientNamePanel;
