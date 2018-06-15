import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink } from "react-router-dom";

import Scrollbar from "common/components/scrollbar";

@inject("userStore", "patientsStore")
@observer
class Sidebar extends Component {
  render() {
    const { userStore } = this.props;

    return (
      <div id="sidemenu">
        <div className="flex-header">
          <div className="team-user">
            <h4 className="team-name">Engage</h4>
            <div className="user-name">
              <span className="user-name__status-icon">
                <i className="fa fa-circle" />
              </span>
              <span className="user-name__text">{userStore.fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-content">
          <div className="rooms-menu">
            <Scrollbar
              className="scrollbar"
              viewRef={ref => {
                this.scrollbar = ref;
              }}
            >
              <div className="rooms-menu__scroll-wrap">
                <div className="menu-nav m-b-20">
                  <div className="heading">
                    <h5>Segments</h5>
                  </div>

                  <NavLink
                    to="/patients"
                    className="item"
                    activeClassName="active"
                  >
                    <div className="item-icon">
                      <i className="fa fa-pie-chart" />
                    </div>
                    <div className="item-text">All Segments</div>
                  </NavLink>

                  <a role="button" className="invite-link">
                    Add Segment
                  </a>
                </div>
              </div>
            </Scrollbar>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
