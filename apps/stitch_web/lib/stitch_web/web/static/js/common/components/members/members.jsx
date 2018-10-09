import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Select from "react-select";
import { isFullMember } from "lib/utils";

import MemberOption from "./member_option";

@inject("usersStore", "presenceStore")
@observer
class Members extends Component {
  getOptions = () => {
    const { usersStore: { activatedUsers }, presenceStore } = this.props;

    return activatedUsers
      .filter(user => !user.is_bot && isFullMember(user))
      .sort((user1, user2) => {
        // Sort alphabetically by online users first
        if (presenceStore.isOnline(user1.id) > presenceStore.isOnline(user2.id))
          return -1;
        if (presenceStore.isOnline(user1.id) < presenceStore.isOnline(user2.id))
          return 1;
        if (user1.first_name < user2.first_name) return -1;
        if (user1.first_name > user2.first_name) return 1;
        return 0;
      })
      .map(user => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        online: presenceStore.isOnline(user.id)
      }));
  };

  render() {
    const { onChange, value, className, ...otherProps } = this.props;

    return (
      <Select
        multi
        simpleValue
        className={className}
        placeholder="Search by name or username"
        onChange={onChange}
        value={value}
        valueKey="id"
        labelKey="name"
        optionComponent={MemberOption}
        options={this.getOptions()}
        promptTextCreator={label => `Add member - ${label}`}
        {...otherProps}
      />
    );
  }
}

Members.propTypes = {
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Members.defaultProps = {
  onChange: () => {},
  value: "",
  className: "multi-select-large"
};

export default Members;
