import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Async } from "react-select";

import MemberOption from "./member_option";
import { filterUsers } from "lib/utils";

@inject("usersStore", "presenceStore")
@observer
class Members extends Component {
  constructor(props) {
    super(props);
    this.state = { members: props.value || [] };
  }

  componentWillReceiveProps(nextProps) {
    if (
      Array.isArray(nextProps.value) &&
      nextProps.value.length !== this.props.value.length
    ) {
      this.setState({ members: nextProps.value });
    }
  }

  _getMembers = term => {
    const { usersStore: { activatedUsers }, presenceStore } = this.props;

    return new Promise(resolve => {
      resolve({
        options: filterUsers(activatedUsers, term).map(user => ({
          ...user,
          online: presenceStore.isOnline(user.id)
        }))
      });
    });
  };

  render() {
    return (
      <Async
        multi
        className="multi-select-large"
        placeholder="Search by name or username"
        onChange={this.props.onChange}
        value={this.state.members}
        valueKey="id"
        labelKey="full_name"
        optionComponent={MemberOption}
        loadOptions={this._getMembers}
        promptTextCreator={label => `Add member - ${label}`}
      />
    );
  }
}

export default Members;
