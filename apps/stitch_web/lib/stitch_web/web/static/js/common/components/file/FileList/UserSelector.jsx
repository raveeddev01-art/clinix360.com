import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import MemberOption from "common/components/members/member_option";

class UserSelector extends Component {
  render() {
    return (
      <Select
        id="file-user-select"
        options={this.props.users}
        placeholder="Select User"
        simpleValue
        searchable
        clearable
        valueKey="id"
        labelKey="full_name"
        optionComponent={MemberOption}
        value={this.props.creatorId}
        onChange={this.props.onSelect}
      />
    );
  }
}

UserSelector.propTypes = {
  users: PropTypes.array.isRequired,
  creatorId: PropTypes.number,
  onSelect: PropTypes.func.isRequired
};

UserSelector.defaultProps = {
  creatorId: undefined
};

export default UserSelector;
