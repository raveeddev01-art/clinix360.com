import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import Select from "react-select";
import cx from "classnames";

@inject("groupsStore", "presenceStore")
@observer
class Groups extends Component {
  onChange = newValue => {
    const { onChange } = this.props;
    if (typeof onChange === "function") {
      onChange(newValue);
    }
  };

  getIconClass(room) {
    const { presenceStore } = this.props;
    let iconClass;

    if (room.type === "regular" && room.public === false) {
      iconClass = "fa-lock";
    } else if (room.type === "regular") {
      iconClass = "fa-comments";
    } else if (room.type === "dm") {
      const otherUser = room.users.find(user => user.id !== currentUser.id);
      iconClass =
        !otherUser || presenceStore.isOnline(otherUser.id)
          ? "fa-circle"
          : "fa-circle-o";
    } else {
      iconClass = "fa-link";
    }

    return cx("fa", iconClass);
  }

  get groupOptions() {
    return this.props.groupsStore.groups
      .filter(this.matchesType)
      .map(this.groupToSelectVal);
  }

  matchesType = group => {
    return this.props.type === "all" || this.props.type === group.type;
  };

  groupToSelectVal = group => {
    return {
      label: this.props.groupsStore.getGroupName(group),
      value: group.id,
      room: group
    };
  };

  renderOption = option => {
    return (
      <span>
        <i className={this.getIconClass(option.room)} /> {option.label}
      </span>
    );
  };

  render() {
    const { value, multi } = this.props;

    return (
      <Select
        className="multi-select-large"
        options={this.groupOptions}
        optionRenderer={this.renderOption}
        simpleValue
        multi={multi}
        value={value}
        onChange={this.onChange}
        clearable={!multi}
        searchable
      />
    );
  }
}

Groups.propTypes = {
  type: PropTypes.string,
  multi: PropTypes.bool.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func
};

Groups.defaultProps = {
  type: "all",
  value: null,
  multi: false,
  onChange: () => {}
};

export default Groups;
