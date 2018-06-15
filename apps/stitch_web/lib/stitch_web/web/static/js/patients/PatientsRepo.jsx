import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import ReactTable from "react-table";

import PatientModal from "./PatientModal";
import PatientsHeader from "./PatientsHeader";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    const { patientsStore } = this.props;

    const data = patientsStore.patientsForPage;

    const columns = [
      {
        Header: "Name",
        id: "name",
        accessor: d => d,
        Cell: row => (
          <span className="user-cell">
            <img
              alt={row.value.full_name}
              className="img-responsive img-circle"
              src={row.value.avatar}
            />
            <span className="name">{row.value.full_name}</span>
          </span>
        )
      },
      {
        Header: "MRN",
        id: "MRN",
        width: 200,
        accessor: d => d,
        Cell: row => <code>#{row.value.mrn}</code>
      },
      {
        Header: "Email",
        accessor: "email"
      },
      {
        Header: "Engage",
        accessor: "engage",
        width: 160,
        Cell: () => (
          <span>
            <a role="button" className="btn btn-default">
              Message
            </a>
          </span>
        )
      }
    ];

    return (
      <div className="patients">
        <PatientsHeader />

        <div className="patients-list-wrapper">
          <ReactTable
            data={data}
            columns={columns}
            showPaginationTop
            showPaginationBottom={false}
            showPageSizeOptions={false}
            resizable={false}
          />
        </div>

        <PatientModal />
      </div>
    );
  }
}

export default PatientsRepo;
