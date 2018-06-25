import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import { Avatar } from "common/components";

class PatientOption extends Component {
  handleMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();

    const { onSelect, option } = this.props;

    onSelect(option, event);
  };

  handleMouseEnter = event => {
    const { onFocus, option } = this.props;

    onFocus(option, event);
  };

  handleMouseMove = event => {
    const { isFocused, onFocus, option } = this.props;

    if (isFocused) {
      return;
    }

    onFocus(option, event);
  };

  render() {
    const { option, className } = this.props;

    return (
      <div
        className={cx(className, "select-option")}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        title={option.username}
      >
        <Avatar user={option} />
        <span>{`${option.first_name} ${option.last_name}`}</span>
        <small>{option.username}</small>
      </div>
    );
  }
}

PatientOption.propTypes = {
  className: PropTypes.string,
  isFocused: PropTypes.bool,
  onFocus: PropTypes.func,
  onSelect: PropTypes.func,
  option: PropTypes.object.isRequired
};

PatientOption.defaultProps = {
  className: "",
  isFocused: false,
  onFocus: () => {},
  onSelect: () => {}
};

export default PatientOption;
