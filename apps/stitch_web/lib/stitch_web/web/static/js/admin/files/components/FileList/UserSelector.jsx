import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import MemberOption from "common/components/members/member_option";

const UserSelector = ({ users, creatorId, onSelect }) => {
  return (
    <Select
      id="file-user-select"
      options={users}
      placeholder="Select User"
      simpleValue
      searchable
      clearable
      valueKey="id"
      labelKey="full_name"
      optionComponent={MemberOption}
      value={creatorId}
      onChange={onSelect}
    />
  );
};

UserSelector.propTypes = {
  users: PropTypes.array.isRequired,
  creatorId: PropTypes.number,
  onSelect: PropTypes.func.isRequired
};

UserSelector.defaultProps = {
  creatorId: undefined
};

export default UserSelector;
