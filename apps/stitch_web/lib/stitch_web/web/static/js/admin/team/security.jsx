import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import TeamExport from "./export";
import TeamImport from "./import";
import TeamHipaa from "./hipaa";
import AccessLogsPanel from "./security/access-logs/access-logs-panel";
import MemberExportsPanel from "./member-exports-panel";
import MemberExportModal from "./member-export-modal";

@inject("titleStore", "adminPanelStore")
class TeamSecurity extends Component {
  constructor() {
    super();
    this.state = {
      isMemberExportModalVisible: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Security");
    this.props.adminPanelStore.setHeading("Security", "fa-shield");
  }

  showMemberExportModal = () =>
    this.setState({ isMemberExportModalVisible: true });
  hideMemberExportModal = () =>
    this.setState({ isMemberExportModalVisible: false });

  render() {
    const { isMemberExportModalVisible } = this.state;

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-shield" /> Security
          </h1>
        </Panel.Heading>

        <Panel.Body>
          <TeamHipaa />
          <AccessLogsPanel />
          <TeamExport />
          <MemberExportsPanel onShowModal={this.showMemberExportModal} />
          <TeamImport />
          {isMemberExportModalVisible && (
            <MemberExportModal onCloseModal={this.hideMemberExportModal} />
          )}
        </Panel.Body>
      </Panel>
    );
  }
}

export default TeamSecurity;
