import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import cx from "classnames";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import Sidebar from "./sidebar";
import Topbar from "./topbar";
import TeamSecurity from "./team/security";
import TeamSettings from "./team/settings/index";
import YouNotifications from "./you/notifications";
import ProfileSettings from "./you/profile/index";
import AccountSettings from "./you/account/index";
import UsersInvitations from "./users/invitations";
import UsersMembers from "./users/members";
import UsersPending from "./users/pending";
import Billing from "./billing/billing";
import Analytics from "./analytics/index";
import Switcher from "../common/components/switcher/index";
import { isAdmin } from "../util/utils";

@inject("titleStore")
@observer
class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpened: false
    };
  }

  componentWillMount() {
    const { history } = this.props;
    this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
  }

  componentWillUnmount() {
    if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
  }

  handleLocationChange = () => {
    this._hideSidebar();
  };

  _toggleSidebar = () => {
    this.setState({ sidebarOpened: !this.state.sidebarOpened });
  };

  _hideSidebar = () => {
    this.setState({ sidebarOpened: false });
  };

  renderAdminRoutes = () => {
    return [
      <Route key="route_admin_team" exact path={`/admin/team`} component={TeamSettings} />,
      <Route key="route_admin_team_settings" path={`/admin/team/settings`} component={TeamSettings} />,
      <Route key="route_admin_team_security" path={`/admin/team/security`} component={TeamSecurity} />,
      <Route key="route_admin_user_invitations"
        path={`/admin/users/invitations`}
        component={UsersInvitations}
      />,
      <Route key="route_admin_users_members" path={`/admin/users/members`} component={UsersMembers} />,
      <Route key="route_admin_pending" path={`/admin/users/pending`} component={UsersPending} />,
      <Route key="route_admin_billing" path={`/admin/billing`} component={Billing} />,
      <Route key="route_admin_analytics" path={`/admin/analytics`} component={Analytics} />
    ];
  }

  render() {
    const { sidebarOpened } = this.state;
    const { titleStore } = this.props;

    const adminWrapperClass = cx("admin-wrapper", {
      "sidebar-opened": sidebarOpened
    });

    return (
      <div className={adminWrapperClass}>
        <Helmet>
          <title>{titleStore.title}</title>
        </Helmet>
        <Switcher />
        <Sidebar onHideSidebar={this._hideSidebar} />
        <div className="admin-content">
          <Topbar onToggleSidebar={this._toggleSidebar} />
          <div
            className="admin-content-wrapper"
            onClick={() => this._hideSidebar()}
          >
            <Switch>
              {isAdmin() && this.renderAdminRoutes()}
              <Route
                path={`/admin/you/notifications`}
                component={YouNotifications}
              />
              <Route path={`/admin/you/profile`} component={ProfileSettings} />
              <Route path={`/admin/you/account`} component={AccountSettings} />

              <Redirect to={`/admin/you/account`} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminApp;
