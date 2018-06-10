import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";

function noop() {}

class PatientListItem extends Component {
  render() {
    const { patient: { avatar, full_name, mrn } } = this.props;

    return (
      <div className="patient-list-item">
        <div className="patient-list-info">
          <div className="patient-list-info-avatar">
            <img
              alt={full_name}
              className="img-responsive img-circle"
              src={avatar}
            />
          </div>
          <div className="patient-list-info-text-wrapper">
            <div className="patient-list-info-name">{full_name}</div>
            <div className="patient-list-info-mrn">#{mrn}</div>
          </div>
        </div>
        <div className="patient-list-spacer" />
        <div className="patient-list-actions">
          <Button bsStyle="primary" onClick={noop}>
            Manage
          </Button>
        </div>
      </div>
    );
  }
}

export default PatientListItem;
