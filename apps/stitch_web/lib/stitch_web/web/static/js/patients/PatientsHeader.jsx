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

    if (pageCount <= 1) return <div />;

    const onFirstPage = page === 0;
    const onFinalPage = page + 1 === pageCount;

    return (
      <div className="patients-header-pager-buttons">
        {!onFirstPage && (
          <button className="btn btn-sm btn-default" onClick={decPage}>
            {" "}
            <i className="fa fa-chevron-left" />{" "}
          </button>
        )}

        {!onFinalPage && (
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

    if (totalVisiblePatients <= 1) return <div />;

    return (
      <div className="patients-header-pager-text">
        {lowestVisibleIndex}-{highestVisibleIndex} of {totalVisiblePatients}
      </div>
    );
  }

  render() {
    const { patientsStore } = this.props;

    return (
      <div className="patients-header">
        <div className="patients-header-count">
          <h4>All Patients</h4>
        </div>
        {/* <div className="patients-header-pager">
          {this.renderPagerButtons()}
          {this.renderPagerText()}
        </div> */}

        <div className="patients-header-center" />

        {/* <div className="patients-header-search">
          <input
            type="text"
            className="form-control input-sm"
            placeholder="Filter patients"
            onChange={this.onFilterChange}
          />
        </div> */}

        <a
          role="button"
          className="btn btn-primary"
          onClick={patientsStore.openModal}
        >
          <i className="fa fa-plus" /> Add Patient
        </a>
      </div>
    );
  }
}

export default PatientsHeader;
