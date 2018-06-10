import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PatientsHeader from "./PatientsHeader";
import MemberItem from "../admin/users/member-item";

function noop() {}

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    const { patientsStore } = this.props;

    return (
      <div className="patients-repo">
        <PatientsHeader />
        <div className="patients-table">
          {patientsStore.patients.map(patient => (
            <MemberItem
              onSuccess={noop}
              onError={noop}
              hideAlert={noop}
              user={Object.assign({ roles: [] }, patient)}
              online={false}
              key={patient.id}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default PatientsRepo;
