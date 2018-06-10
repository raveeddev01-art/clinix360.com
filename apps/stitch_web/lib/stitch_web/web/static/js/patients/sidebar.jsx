import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Select from "react-select";

function noop() {}

const sortOptions = [
  {
    name: "list_sort",
    title: "List Sort",
    values: [
      { id: "first_name", display: "First Name" },
      { id: "last_name", display: "Last Name" },
      { id: "mrn", display: "MRN" }
    ]
  },
  {
    name: "direction",
    title: "Direction",
    values: [
      { id: "asc", display: "Ascending" },
      { id: "desc", display: "Descending" }
    ]
  },
  {
    name: "status",
    title: "Status",
    values: [
      { id: "active", display: "Active" },
      { id: "inactive", display: "Inactive" },
      { id: "pending", display: "Pending" },
      { id: "any", display: "Any" }
    ]
  }
];

@inject("teamStore", "userStore")
@observer
class Sidebar extends Component {
  renderOption({ name, title, values }) {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>{title}:</h5>
          <div className="patients-dropdown-wrapper">
            <Select
              searchable={false}
              clearable={false}
              className="patients-select-option"
              placeholder={title}
              onChange={noop}
              value={values[0].id}
              valueKey="id"
              labelKey="display"
              options={values}
            />
          </div>
        </div>
      </div>
    );
  }

  renderOptions() {}

  render() {
    const { userStore } = this.props;

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
          {sortOptions.map(this.renderOption)}
        </div>
      </div>
    );
  }
}

export default Sidebar;
