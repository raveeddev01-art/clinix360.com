import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("presenceStore")
@observer
class Switcher extends Component {
  render() {
    return (
      <div className="switcher">
        <div className="switcher__top">
          {/* <div className="switcher__logo" /> */}
          <NavLink to="/admin/you/home" className="switcher__link">
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Home</Tooltip>}
            >
              <i className="fa fa-home" />
            </OverlayTrigger>
          </NavLink>
          <NavLink to="/" className="switcher__link">
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Stitch Connect</Tooltip>}
            >
              <i className="fa fa-comments" />
            </OverlayTrigger>
          </NavLink>
        </div>
        <div className="switcher__bottom">
          <NavLink to="/admin/you/account" className="switcher__link">
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Settings</Tooltip>}
            >
              <i className="fa fa-cog" />
            </OverlayTrigger>
          </NavLink>
          <a
            role="link"
            onClick={this.props.presenceStore.lock}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Lockout</Tooltip>}
            >
              <i className="fa fa-lock" />
            </OverlayTrigger>
          </a>
          <a href="/logout" className="switcher__link">
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Sign Out</Tooltip>}
            >
              <i className="fa fa-sign-out" />
            </OverlayTrigger>
          </a>
        </div>
      </div>
    );
  }
}

export default withRouter(Switcher);
