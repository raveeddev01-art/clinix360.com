import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import noop from "lodash/noop";

class MemberOption extends Component {
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
        {option.online ? (
          <i className="fa fa-circle" />
        ) : (
          <i className="fa fa-circle-o" />
        )}
        <span>{`${option.first_name} ${option.last_name}`}</span>
        <small>{option.username}</small>
      </div>
    );
  }
}

MemberOption.propTypes = {
  className: PropTypes.string,
  isFocused: PropTypes.bool,
  onFocus: PropTypes.func,
  onSelect: PropTypes.func,
  option: PropTypes.object.isRequired
};

MemberOption.defaultProps = {
  className: "",
  isFocused: false,
  onFocus: noop,
  onSelect: noop
};

export default MemberOption;
