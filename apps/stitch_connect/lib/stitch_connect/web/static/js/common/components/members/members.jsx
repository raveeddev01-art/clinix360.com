import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Async } from "react-select";

import MemberOption from "./member_option";

@inject("presenceStore")
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
    const { presenceStore } = this.props;

    return post(`/api/v1/users/search`, { body: { term } }).then(resp => {
      const onlineUsers = Object.keys(presenceStore.onlineUsersMap);
      const options = resp.data.filter(user => !user.disabled).map(user => ({
        ...user,
        online: onlineUsers.indexOf(`${user.id}`) > -1
      }));
      return { options, complete: true };
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

Members.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired
};

Members.defaultProps = {
  onChange: () => {},
  value: ""
};

export default Members;
