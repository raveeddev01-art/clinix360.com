import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("patientsStore")
@observer
class PatientsHeader extends Component {
  onFilterChange = e => {
    const { setSearchFilter } = this.props.patientsStore;
    setSearchFilter(e.target.value);
  };

  render() {
    const { patients } = this.props.patientsStore;

    return (
      <div className="patients-header">
        <div className="patients-header-count">
          <h4>{patients.length} Patients</h4>
        </div>
        <div className="patients-header-center" />
        <div className="patients-header-search">
          <input
            type="text"
            className="form-control input-sm"
            placeholder="Filter patients"
            onChange={this.onFilterChange}
          />
        </div>
      </div>
    );
  }
}

export default PatientsHeader;
