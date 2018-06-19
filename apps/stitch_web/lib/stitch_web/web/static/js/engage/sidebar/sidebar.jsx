import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter, NavLink } from "react-router-dom";

import Scrollbar from "common/components/scrollbar";

@inject("teamStore", "userStore", "inboxStore")
@observer
class Sidebar extends Component {
  componentWillMount() {
    const { inboxStore } = this.props;
    inboxStore.loadInboxes();
  }

  render() {
    const { userStore, inboxStore } = this.props;

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
                    <h5>Inboxes</h5>
                  </div>

                  <NavLink
                    to={`/engage/1`}
                    className="item"
                    activeClassName="active"
                  >
                    <div className="item-icon">
                      <i className="fa fa-inbox" />
                    </div>
                    <div className="item-text">
                      {inboxStore.defaultInbox.name}
                    </div>
                  </NavLink>

                  {/* <a role="button" className="invite-link">
                    Add Inbox
                  </a> */}
                </div>
              </div>
            </Scrollbar>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
