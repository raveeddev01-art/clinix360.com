import React, { Component } from "react";
import { observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";
import TeamStore from "../../stores/team_store";

const title = "Delete Team";
const description =
  "Deleting your team will remove all users and data. You won't be able to recover this information.";

// @TODO replace console.error and window.prompt with notification component
class DeleteTeamPanel extends Component {
  _onDelete = () => {
    const teamName = window.prompt("Please enter team name to confirm action");
    if (teamName === TeamStore.instance.teamName) {
      TeamStore.instance.deleteTeam();
    } else {
      console.error("Team name does not match");
    }
  };

  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        saveButtonText="Delete Team"
        onSave={this._onDelete}
      >
        <HelpBlock>
          If you delete your team, all users will be unable to log into Stitch.
          Please be sure to export any data before proceeding. If you have any
          questions, please send us an email at&nbsp;
          <a href="mailto:support@teamstitch.com">support@teamstitch.com</a>
        </HelpBlock>
      </SettingPanel>
    );
  }
}

export default DeleteTeamPanel;
