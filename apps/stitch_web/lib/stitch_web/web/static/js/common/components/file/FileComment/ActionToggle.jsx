import React, { Component } from "react";
import PropTypes from "prop-types";

class ActionToggle extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    return <a onClick={this.handleClick}>{this.props.children}</a>;
  }
}

ActionToggle.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

ActionToggle.defaultProps = {
  onClick: () => undefined
};

export default ActionToggle;
