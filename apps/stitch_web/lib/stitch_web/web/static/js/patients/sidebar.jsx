import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Select from "react-select";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

const sortOptions = [
  {
    name: "listSort",
    title: "List Sort",
    values: [
      { id: "first_name", display: "First Name" },
      { id: "last_name", display: "Last Name" },
      { id: "mrn", display: "MRN" },
      { id: "inserted_at", display: "Date Added" }
    ]
  },
  {
    name: "sortDirection",
    title: "Direction",
    values: [
      { id: "asc", display: "Ascending" },
      { id: "desc", display: "Descending" }
    ]
  },
  {
    name: "statusFilter",
    title: "Status",
    values: [
      { id: "all", display: "All" },
      { id: "onboarded", display: "Onboarded" },
      { id: "pending", display: "Pending" },
      { id: "deactivated", display: "Deactivated" }
    ]
  }
];

@inject("userStore", "patientsStore")
@observer
class Sidebar extends Component {
  onSelectChange = name => ({ id: val }) => {
    this.props.patientsStore.setOption(name, val);
  };

  render() {
    const { patientsStore, userStore } = this.props;
    return (
      <div className="sidebar patients-sidebar">
        <div className="flex-header m-b-10">
          <div className="team-user">
            <h4 className="team-name">Patients</h4>
            <div className="user-name">
              <span className="user-name__status-icon">
                <i className="fa fa-circle" />
              </span>
              <span className="user-name__text">{userStore.fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-container patients-sidebar-options">
          {sortOptions.map(({ name, title, values }) => {
            const setValue = values.find(
              v => v.id === patientsStore.getOption(name)
            );
            return (
              <div className="menu-nav m-b-20" key={name}>
                <div className="hidden">
                  {/* forcing mobx to re-render */}
                  {/* TODO: figure out a nicer way */}
                  {patientsStore.listSort} {patientsStore.sortDirection}{" "}
                  {patientsStore.searchFilter} {patientsStore.statusFilter}
                </div>
                <div className="heading">
                  <h5>{title}:</h5>
                  <div className="patients-dropdown-wrapper">
                    <Select
                      searchable={false}
                      clearable={false}
                      className="patients-select-option"
                      onChange={this.onSelectChange(name)}
                      value={setValue}
                      valueKey="id"
                      labelKey="display"
                      options={values}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="patients-sidebar-add-link">
            <h5>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="open-a-direct-message">Add Patient</Tooltip>
                }
              >
                <a role="button" onClick={patientsStore.openModal}>
                  Add Patient
                </a>
              </OverlayTrigger>
            </h5>

            <div className="patients-sidebar-add-link__action">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="open-a-direct-message">Add Patient</Tooltip>
                }
              >
                <a onClick={patientsStore.openModal}>
                  <i className="fa fa-plus-square-o" />
                </a>
              </OverlayTrigger>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
