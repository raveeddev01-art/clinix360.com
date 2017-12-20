import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Select from "react-select";

import MemberOption from "./member_option";

@inject("usersStore", "presenceStore")
@observer
class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: props.value || []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      Array.isArray(nextProps.value) &&
      nextProps.value.length !== this.props.value.length
    ) {
      this.setState({ members: nextProps.value });
    }
  }

  getOptions = () => {
    const { usersStore: { activatedUsers }, presenceStore } = this.props;

    return activatedUsers
      .filter(user => user.id !== currentUser.id)
      .map(user => ({
        ...user,
        online: presenceStore.isOnline(user.id)
      }));
  };

  render() {
    const { onChange } = this.props;
    const { members } = this.state;

    return (
      <Select
        multi
        className="multi-select-large"
        placeholder="Search by name or username"
        onChange={onChange}
        value={members}
        valueKey="id"
        labelKey="full_name"
        optionComponent={MemberOption}
        options={this.getOptions()}
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
  value: []
};

export default Members;
