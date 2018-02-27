import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import cx from "classnames";
import Dropdown from "react-bootstrap/lib/Dropdown";

class PortalDropdownMenuInner extends Component {
  constructor(props) {
    super(props);

    // render portal on portal dropdown root.
    // if the root is not found, just create one. otherwise reuse it
    this.el = document.getElementById("portal-dropdown-root");
    if (!this.el) {
      this.el = document.createElement("div");
      this.el.setAttribute("id", "portal-dropdown-root");
      document.body.appendChild(this.el);
    }
  }

  renderMenu() {
    const { children, offset, dropup, ...otherProps } = this.props;
    const wrapperCN = cx("portal-dropdown-inner", {
      dropup // dropup classname is needed for bootstrap dropdown inner menu
    });
    return (
      <div className={wrapperCN} style={offset}>
        <Dropdown.Menu {...otherProps}>{children}</Dropdown.Menu>
      </div>
    );
  }

  render() {
    return ReactDOM.createPortal(this.renderMenu(), this.el);
  }
}

PortalDropdownMenuInner.propTypes = {
  children: PropTypes.node.isRequired,
  offset: PropTypes.object.isRequired,
  dropup: PropTypes.bool
};

PortalDropdownMenuInner.defaultProps = {
  offset: {},
  dropup: false
};

export default PortalDropdownMenuInner;
