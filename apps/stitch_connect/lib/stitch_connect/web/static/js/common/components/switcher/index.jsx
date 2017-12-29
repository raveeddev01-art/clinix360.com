import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import history from "lib/history";

@inject("presenceStore", "groupsStore")
@observer
class Switcher extends Component {
  componentWillMount() {
    const path = history.location.pathname;
    let active = "connect";
    if (path === "/admin/you/account") {
      active = "settings";
    } else if (path.startsWith("/admin")) {
      active = "home";
    }

    this.setState({ active });
  }

  render() {
    const { totalMentionsCount: count, defaultGroup } = this.props.groupsStore;
    const { active } = this.state;

    return (
      <div className="switcher">
        <div className="switcher__top">
          {/* <div className="switcher__logo" /> */}
          <NavLink
            to="/admin/you/home"
            isActive={() => active === "home"}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Home</Tooltip>}
            >
              <i className="fa fa-home" />
            </OverlayTrigger>
          </NavLink>
          <NavLink
            to={`/rooms/${defaultGroup.slug}`}
            isActive={() => active === "connect"}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Stitch&nbsp;Connect</Tooltip>}
            >
              <span className="switcher__link-wrapper">
                <i className="fa fa-comments" />
                {count > 0 && (
                  <span className="switcher__badge">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
            </OverlayTrigger>
          </NavLink>
        </div>
        <div className="switcher__bottom">
          <NavLink
            to="/admin/you/account"
            isActive={() => active === "settings"}
            className="switcher__link"
          >
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
              overlay={<Tooltip id="tooltip-info">Lock&nbsp;Out</Tooltip>}
            >
              <i className="fa fa-lock" />
            </OverlayTrigger>
          </a>
          <a href="/logout" className="switcher__link">
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Sign&nbsp;Out</Tooltip>}
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
