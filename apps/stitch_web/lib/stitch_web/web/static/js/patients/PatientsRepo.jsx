import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";
import MemberItem from "../admin/users/member-item";

function noop() {}

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    const { patientsStore } = this.props;

    return (
      <div className="admin-panel-wrapper patients-panel-wrapper">
        <Panel className="admin-panel">
          <Panel.Heading>
            <h1>
              <i className="fa fa-users" /> Patients
            </h1>
          </Panel.Heading>

          <Panel.Body>
            <div className="pull-right m-u-58">
              <Button
                bsStyle="primary"
                onClick={noop}
                className="btn-invite-members"
              >
                Add Patient
              </Button>
            </div>

            <div className="admin-table m-b-20">
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
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default PatientsRepo;
