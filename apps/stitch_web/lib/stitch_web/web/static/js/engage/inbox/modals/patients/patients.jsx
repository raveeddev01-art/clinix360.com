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
      patient: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ patient: nextProps.value });
  }

  getOptions = () => {
    const { patientsStore } = this.props;

    return patientsStore.patients.map(patient => ({
      ...patient
    }));
  };

  render() {
    const { onChange } = this.props;
    const { patient } = this.state;

    return (
      <Select
        className="multi-select-large"
        placeholder="Enter name, email or MRN"
        onChange={onChange}
        value={patient}
        valueKey="id"
        labelKey="full_name"
        optionComponent={PatientOption}
        options={this.getOptions()}
      />
    );
  }
}

Patients.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired
};

Patients.defaultProps = {
  onChange: () => {},
  value: {}
};

export default Patients;
