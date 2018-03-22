import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import cx from "classnames";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";
import { isAdmin } from "lib/utils";
import RoleChangedModal from "common/modals/role-changed-modal";

import Sidebar from "./sidebar";
import Topbar from "./topbar";
import TeamSecurity from "./team/security";
import TeamSettings from "./team/settings";
import YouHome from "./you/home";
import YouNotifications from "./you/notifications";
import ProfileSettings from "./you/profile";
import AccountSettings from "./you/account";
import Users from "./users";
import Billing from "./billing/billing";
import Analytics from "./analytics";
import Integrations from "./integrations";
import DrChronoPage from "./integrations/drchrono";
import DrChronoSettings from "./integrations/components/drchrono-settings";

@inject("titleStore")
@observer
class AdminApp extends Component {
  renderAdminRoutes = () => {
    return [
      <Route
        key="route_admin_team"
        exact
        path={`/admin/team`}
        component={TeamSettings}
      />,
      <Route
        key="route_admin_team_settings"
        path={`/admin/team/settings`}
        component={TeamSettings}
      />,
      <Route
        key="route_admin_team_security"
        path={`/admin/team/security`}
        component={TeamSecurity}
      />,
      <Route
        key="route_admin_analytics"
        path={`/admin/analytics`}
        component={Analytics}
      />,
      <Route
        key="route_admin_users"
        path={`/admin/members`}
        component={Users}
      />,
      <Route
        key="route_admin_billing"
        path={`/admin/billing`}
        component={Billing}
      />,
      <Route
        exact
        key="route_admin_integrations"
        path={`/admin/integrations`}
        component={Integrations}
      />,
      <Route
        exact
        key="route_admin_integrations_drchrono"
        path={`/admin/integrations/drchrono`}
        component={DrChronoPage}
      />,
      <Route
        exact
        key="route_admin_integrations_drchrono_edit"
        path={`/admin/integrations/drchrono/edit`}
        component={DrChronoSettings}
      />
    ];
  };

  render() {
    const { titleStore } = this.props;

    const adminWrapperClass = cx("admin-wrapper", "appContainer");

    return (
      <div id="app">
        <AppAlert />
        <div className={adminWrapperClass}>
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />
          <Sidebar />
          <div className="admin-content">
            <Topbar />
            <div className="admin-content-wrapper">
              <Switch>
                {isAdmin() && this.renderAdminRoutes()}
                <Route
                  path={`/admin/you/notifications`}
                  component={YouNotifications}
                />
                <Route
                  path={`/admin/you/profile`}
                  component={ProfileSettings}
                />
                <Route
                  path={`/admin/you/account`}
                  component={AccountSettings}
                />
                <Route path={`/admin/you/home`} component={YouHome} />
                <Redirect to={`/admin/you/account`} />
              </Switch>
            </div>
          </div>
          <RoleChangedModal />
        </div>
      </div>
    );
  }
}

export default AdminApp;
