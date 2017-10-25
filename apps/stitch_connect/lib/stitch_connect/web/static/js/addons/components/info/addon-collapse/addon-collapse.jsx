import React, { Component } from "react";
import PropTypes from "prop-types";
import Collapse from "react-bootstrap/lib/Collapse";
import cx from "classnames";

class AddonCollapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  _toggleCollapse = () => {
    this.props.onCollapse(!this.state.collapsed);
    this.setState({ collapsed: !this.state.collapsed });
  };

  render() {
    const { children, icon, title } = this.props;
    const { collapsed } = this.state;
    const iconClass = cx("fa", `fa-${icon}`);
    const caretClass = cx("fa", {
      "fa-caret-down": collapsed,
      "fa-caret-right": !collapsed
    });
    return (
      <div className="addon-collapse">
        <h5 className="subheading" onClick={this._toggleCollapse}>
          <div className="addon-icon">
            <i className={iconClass} />
          </div>
          <div className="flex-item">{title}</div>
          <i className={caretClass} />
        </h5>
        <Collapse in={collapsed}>
          <div>{children}</div>
        </Collapse>
      </div>
    );
  }
}

AddonCollapse.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onCollapse: PropTypes.func.isRequired
};

AddonCollapse.defaultProps = {
  children: null,
  onCollapse: () => {}
};

export default AddonCollapse;
