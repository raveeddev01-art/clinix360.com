import React, { Component, PropTypes } from "react";
import cx from "classnames";

class MemberOption extends Component {
  handleMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  };
  handleMouseEnter = event => {
    this.props.onFocus(this.props.option, event);
  };
  handleMouseMove = event => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
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
        {option.online
          ? <i className="fa fa-circle" />
          : <i className="fa fa-circle-o" />}
        <span>{`${option.first_name} ${option.last_name}`}</span>
        <small>
          {option.username}
        </small>
      </div>
    );
  }
}

MemberOption.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
  isFocused: PropTypes.bool,
  isSelected: PropTypes.bool,
  onFocus: PropTypes.func,
  onSelect: PropTypes.func,
  option: PropTypes.object.isRequired
};

export default MemberOption;
