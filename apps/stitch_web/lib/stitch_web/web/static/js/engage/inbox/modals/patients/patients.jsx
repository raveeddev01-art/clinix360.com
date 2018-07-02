import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Select from "react-select";

import PatientOption from "./patient_option";

@inject("patientsStore")
@observer
class Patients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ patient: nextProps.value });
  }

  getOptions = () => {
    const { patientsStore } = this.props;

    return patientsStore.patients.sort((patient1, patient2) => {
      if (patient1.full_name > patient2.full_name) return 1;
      if (patient1.full_name > patient2.full_name) return -1;
      return 0;
    });
  };

  render() {
    const { onChange, showAddPatientModal } = this.props;
    const { patient } = this.state;

    return (
      <Select
        name={this.props.name}
        className="multi-select-large"
        placeholder="Enter name, email or MRN"
        onChange={onChange}
        value={patient}
        valueKey="mrn"
        labelKey={"full_name"}
        optionComponent={PatientOption}
        options={this.getOptions()}
        noResultsText={
          <span>
            No results found. Create a{" "}
            <a role="button" onClick={showAddPatientModal}>
              new patient
            </a>.
          </span>
        }
      />
    );
  }
}

Patients.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object,
  showAddPatientModal: PropTypes.func.isRequired
};

Patients.defaultProps = {
  onChange: () => {},
  showAddPatientModal: () => {},
  value: {}
};

export default Patients;
