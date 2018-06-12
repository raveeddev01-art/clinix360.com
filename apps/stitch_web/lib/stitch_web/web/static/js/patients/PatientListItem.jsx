import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Button from "react-bootstrap/lib/Button";

@inject("patientsStore")
@observer
class PatientListItem extends Component {
  openPatientManageModal = () => {
    this.props.patientsStore.openModal(this.props.patient.id);
  };

  render() {
    const { patient: { avatar, full_name, mrn } } = this.props;

    return (
      <div className="patients-list-item">
        <div className="patients-list-item-info">
          <div className="patients-list-item-info-avatar">
            <img
              alt={full_name}
              className="img-responsive img-circle"
              src={avatar}
            />
          </div>
          <div className="patients-list-item-info-text-wrapper">
            <div className="patients-list-item-info-name">{full_name}</div>
            <div className="patients-list-item-info-mrn">#{mrn}</div>
          </div>
        </div>
        <div className="patients-list-item-spacer" />
        <div className="patients-list-item-actions">
          <Button bsStyle="primary" onClick={this.openPatientManageModal}>
            Manage
          </Button>
        </div>
      </div>
    );
  }
}

export default PatientListItem;
