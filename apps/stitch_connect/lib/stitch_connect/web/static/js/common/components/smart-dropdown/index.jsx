import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import Dropdown from "react-bootstrap/lib/Dropdown";

class SmartDropdown extends Component {
  constructor(...args) {
    super(...args);
    this.state = { dropup: false };
  }

  checkPosition = isActionDropdownOpen => {
    if (isActionDropdownOpen) {
      const pos = this.node.getBoundingClientRect();
      this.setState({
        dropup: pos.bottom > window.innerHeight * 2 / 3
      });
    }

    this.props.onToggle();
  };

  render() {
    const { dropup } = this.state;

    return (
      <Dropdown
        {...this.props}
        ref={node => {
          this.node = ReactDOM.findDOMNode(node); // eslint-disable-line react/no-find-dom-node
        }}
        dropup={this.props.dropup || dropup}
        onToggle={this.checkPosition}
      />
    );
  }
}

SmartDropdown.propTypes = {
  dropup: PropTypes.bool,
  onToggle: PropTypes.func
};

SmartDropdown.defaultProps = {
  dropup: false,
  onToggle: () => {}
};

export default SmartDropdown;
