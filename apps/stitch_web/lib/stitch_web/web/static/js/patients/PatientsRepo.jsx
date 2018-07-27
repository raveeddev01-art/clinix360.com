import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Switch, Redirect } from "react-router-dom";

import Sidebar from "./sidebar/sidebar";
import Topbar from "./main/topbar";
import Main from "./main/main";
import PatientModal from "./PatientModal";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  componentWillMount() {
    if (this.props.match.params.id) {
      this.openPatient(this.props.match.params.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const newId = this.props.match.params.id !== nextProps.match.params.id;
    if (newId && nextProps.match.params.id) {
      this.openPatient(nextProps.match.params.id);
    }
  }

  openPatient(params) {
    const { patientsStore } = this.props;
    patientsStore.openPatient(params);
  }

  render() {
    const { firstPatientId } = this.props.patientsStore;

    if (!this.props.match.params.id) {
      console.log("wat");
      return (
        // <Switch>
        <Redirect from="*" to={`/patients/${firstPatientId}`} />
        // </Switch>
      );
    }

    console.log("jdfiewji - ", this.props.match.params.id);

    return (
      <div className="engage-wrapper patients-wrapper">
        <Sidebar />

        <div id="main">
          <Topbar />

          <div className="flex-content">
            <Main />
          </div>
        </div>

        <PatientModal />
      </div>
    );
  }
}

export default PatientsRepo;
