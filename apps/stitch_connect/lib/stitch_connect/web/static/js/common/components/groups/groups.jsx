import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import Select from "react-select";
import cx from "classnames";

@inject("groupsStore", "presenceStore")
@observer
class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: props.groupsStore.groups
        .filter(g => props.type === "all" || props.type === g.type)
        .map(g => ({
          label: g.name,
          value: g.id,
          room: g
        }))
    };
  }

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

  renderOption = option => {
    return (
      <span>
        <i className={this.getIconClass(option.room)} /> {option.label}
      </span>
    );
  };

  render() {
    const { value, multi } = this.props;
    const { options } = this.state;

    return (
      <Select
        className="multi-select-large"
        options={options}
        optionRenderer={this.renderOption}
        simpleValue
        multi={multi}
        value={value}
        onChange={this.onChange}
        clearable={!multi}
        searchable={false}
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
