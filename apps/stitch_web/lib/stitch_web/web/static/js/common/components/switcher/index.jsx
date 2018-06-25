import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import history from "lib/history";

@inject("presenceStore", "groupsStore", "teamStore")
@observer
class Switcher extends Component {
  componentWillMount() {
    const path = history.location.pathname;
    let active = "connect";

    if (path.startsWith("/admin")) {
      active = "home";
    } else if (path.startsWith("/conversations")) {
      active = "engage";
    } else if (path === "/engage") {
      active = "engage";
    } else if (path === "/manage") {
      active = "manage";
    } else if (path === "/patients") {
      active = "patients";
    }

    this.setState({ active });
  }

  render() {
    const {
      totalUnreadMessagesCount: unreadsCount,
      totalMentionsCount: mentionsCount,
      defaultGroup
    } = this.props.groupsStore;
    const { engageEnabled } = this.props.teamStore;

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
              <img
                className="switcher__top-home"
                src="/images/logo-white.svg"
                alt="Stitch"
              />
            </OverlayTrigger>
          </NavLink>

          {engageEnabled && (
            <NavLink
              to={`/patients`}
              isActive={() => active === "patients"}
              className="switcher__link"
            >
              <OverlayTrigger
                placement="right"
                container={this}
                overlay={<Tooltip id="tooltip-info">Patients</Tooltip>}
              >
                <span className="switcher__link-wrapper">
                  <i className="fa fa-users" />
                </span>
              </OverlayTrigger>
            </NavLink>
          )}

          <NavLink
            to={`/rooms/${defaultGroup.slug}`}
            isActive={() => active === "connect"}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Connect</Tooltip>}
            >
              <span className="switcher__link-wrapper">
                <i className="fa fa-comments" />
                {mentionsCount > 0 && (
                  <span className="switcher__badge mentions">
                    {mentionsCount > 9 ? "9+" : mentionsCount}
                  </span>
                )}

                {unreadsCount > 0 &&
                  !mentionsCount && (
                    <span className="switcher__badge unreads">
                      <i className="fa fa-circle" />
                    </span>
                  )}
              </span>
            </OverlayTrigger>
          </NavLink>

          <NavLink
            to={engageEnabled ? "/conversations" : "/engage"}
            isActive={() => active === "engage"}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Engage</Tooltip>}
            >
              <span className="switcher__link-wrapper">
                <i className="fa fa-bullhorn" />
              </span>
            </OverlayTrigger>
          </NavLink>

          <NavLink
            to={`/manage`}
            isActive={() => active === "manage"}
            className="switcher__link"
          >
            <OverlayTrigger
              placement="right"
              container={this}
              overlay={<Tooltip id="tooltip-info">Manage</Tooltip>}
            >
              <span className="switcher__link-wrapper">
                <i className="fa fa-tasks" />
              </span>
            </OverlayTrigger>
          </NavLink>
        </div>

        <div className="switcher__bottom">
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
