import React, { Component } from "react";
import times from "lodash/times";
import { inject, observer } from "mobx-react";

@inject("patientsStore")
@observer
class PatientsHeader extends Component {
  onFilterChange = e => {
    const { setSearchFilter } = this.props.patientsStore;
    setSearchFilter(e.target.value);
  };

  renderPageButton = pageIndex => {
    const { setPage } = this.props.patientsStore;
    return <button onClick={() => setPage(pageIndex)}>{pageIndex + 1}</button>;
  };

  render() {
    const { page, incPage, decPage } = this.props.patientsStore;
    const pages = this.props.patientsStore.pageCount;

    return (
      <div className="patients-header">
        <div className="patients-header-count">
          <h4>
            {this.props.patientsStore.sortedAndFilteredPatients.length} Patients
          </h4>
        </div>
        <div className="patients-header-center">
          <div> Page: {page + 1} </div>
          <div>{times(pages).map(this.renderPageButton)}</div>
        </div>
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
