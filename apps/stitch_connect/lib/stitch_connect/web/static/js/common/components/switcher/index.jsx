import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";

class Switcher extends Component {
  render() {
    return (
      <div className="switcher">
        <div className="switcher__top">
          <div className="switcher__logo" />
          <NavLink
            to="/"
            className="switcher__link"
            activeClassName="switcher__link--active"
          >
            <i className="fa fa-comments" />
          </NavLink>
        </div>
        <div className="switcher__bottom">
          <NavLink
            to="/admin/you/account"
            className="switcher__link"
            activeClassName="switcher__link--active"
          >
            <i className="fa fa-cog" />
          </NavLink>
        </div>
      </div>
    );
  }
}

export default withRouter(Switcher);
