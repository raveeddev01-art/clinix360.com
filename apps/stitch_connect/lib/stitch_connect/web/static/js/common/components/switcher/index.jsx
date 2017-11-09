import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";

class Switcher extends Component {
  render() {
    return (
      <div className="switcher">
        <div className="switcher__top">
          {/* <div className="switcher__logo" /> */}
          <NavLink to="/admin/you/account" className="switcher__link">
            <i className="fa fa-home" />
          </NavLink>
          <NavLink to="/" className="switcher__link">
            <i className="fa fa-comments" />
          </NavLink>
        </div>
        <div className="switcher__bottom">
          <NavLink to="/admin/you/account" className="switcher__link">
            <i className="fa fa-cog" />
          </NavLink>
          <a href="/logout" className="switcher__link">
            <i className="fa fa-sign-out" />
          </a>
        </div>
      </div>
    );
  }
}

export default withRouter(Switcher);
