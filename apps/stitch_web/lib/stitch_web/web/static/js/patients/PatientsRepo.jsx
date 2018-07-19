import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Sidebar from "./sidebar/sidebar";
import Topbar from "./main/topbar";
import Main from "./main/main";
import PatientModal from "./PatientModal";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  componentWillMount() {
    this.openPatient(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.openPatient(nextProps.match.params.id);
    }
  }

  openPatient(params) {
    const { patientsStore } = this.props;
    patientsStore.openPatient(params);
  }

  render() {
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
