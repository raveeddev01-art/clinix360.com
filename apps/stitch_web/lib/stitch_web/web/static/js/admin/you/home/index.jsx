import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import HomeItem from "./home-item";
import { isAdmin, isMemberOrAdmin } from "../../../lib/utils";

@inject("titleStore", "adminPanelStore", "userStore")
export default class YouHome extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Home");
    this.props.adminPanelStore.setHeading("Home", "fa-home");
  }

  renderIntegrationLink() {
    return (
      <HomeItem
        icon="fa-database"
        title="Integrations"
        description="Install applications that send notifications and events into Stitch rooms."
        openButtonText="Open"
        link="/admin/integrations"
        openExternal
      />
    );
  }

  renderAdminItems() {
    return (
      <div className="admin-admin-wrapper">
        <h4>Administration</h4>
        <HomeItem
          icon="fa-cog"
          title="Settings"
          description="Edit your team's settings, brand, and profile."
          openButtonText="Open"
          link="/admin/team/settings"
        />
        <HomeItem
          icon="fa-shield"
          title="Security"
          description="Access and download your team's HIPAA settings, BAA contract, and compliance exports."
          openButtonText="Open"
          link="/admin/team/security"
        />
        <HomeItem
          icon="fa-bar-chart"
          title="Analytics"
          description="View your team's statistics and usage across different applications."
          openButtonText="Open"
          link="/admin/analytics"
        />
        <HomeItem
          icon="fa-users"
          title="Members"
          description="Manage your members's roles, access, and invitations."
          openButtonText="Open"
          link="/admin/members"
        />
        {(!window.electronApp || window.electronEnv !== "store") && (
            <HomeItem
              icon="fa-credit-card"
              title="Billing"
              description="Subscribe to Stitch plans across different products, edit your team payment details, and access invoice history."
              openButtonText="Open"
              link="/admin/billing"
            />
          )}
      </div>
    );
  }

  render() {
    return (
      <Panel className="admin-panel home-panel">
        <Panel.Heading>
          <h1>Welcome, {this.props.userStore.firstName}!</h1>
        </Panel.Heading>

        <Panel.Body>
          <div className="admin-products-wrapper">
            <HomeItem
              icon="fa-comments"
              title="Stitch Connect"
              description="Team Communication: Send messages, write notes, upload files, and track tasks on any device."
              openButtonText="Launch"
              link="/"
            />
          </div>

          <div className="admin-account-wrapper">
            <h4>You</h4>
            <HomeItem
              icon="fa-cog"
              title="Account"
              description="Edit your account settings, including email, username, password, and PIN settings."
              openButtonText="Open"
              link="/admin/you/account"
            />
            <HomeItem
              icon="fa-user"
              title="Profile"
              openButtonText="Open"
              description="Set your personal profile details, including name, phone number, and title."
              link="/admin/you/profile"
            />
            <HomeItem
              icon="fa-bell"
              title="Notifications"
              description="Adjust notification settings across browser, desktop, mobile. Manage email and room specific notifications as well."
              openButtonText="Open"
              link="/admin/you/notifications"
            />

            {isMemberOrAdmin() && this.renderIntegrationLink()}
          </div>

          {isAdmin() && this.renderAdminItems()}
        </Panel.Body>
      </Panel>
    );
  }
}
