import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("patientsStore")
@observer
class PatientsHeader extends Component {
  onFilterChange = e => {
    const { setSearchFilter } = this.props.patientsStore;
    setSearchFilter(e.target.value);
  };

  renderPagerButtons() {
    const { page, incPage, decPage, pageCount } = this.props.patientsStore;

    if (pageCount === 1) return <div />;

    return (
      <div className="patients-header-pager-buttons">
        {page !== 0 && (
          <button className="btn btn-sm btn-default" onClick={decPage}>
            {" "}
            <i className="fa fa-chevron-left" />{" "}
          </button>
        )}
        {page + 1 !== pageCount && (
          <button className="btn btn-sm btn-default" onClick={incPage}>
            {" "}
            <i className="fa fa-chevron-right" />{" "}
          </button>
        )}
      </div>
    );
  }

  renderPagerText() {
    const {
      lowestVisibleIndex,
      highestVisibleIndex,
      totalVisiblePatients
    } = this.props.patientsStore;

    return (
      <div className="patients-header-pager-text">
        {lowestVisibleIndex}-{highestVisibleIndex} of {totalVisiblePatients}
      </div>
    );
  }

  render() {
    return (
      <div className="patients-header">
        <div className="patients-header-count">
          <h4>{this.props.patientsStore.totalVisiblePatients} Patients</h4>
        </div>
        <div className="patients-header-pager">
          {this.renderPagerButtons()}
          {this.renderPagerText()}
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
