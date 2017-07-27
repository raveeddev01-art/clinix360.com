import React, { Component } from "react";
import { observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Delete Team";
const description =
  "Deleting your team will remove all users and data. You won't be able to recover this information.";

class DeleteTeamPanel extends Component {
  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        saveButtonText="Delete Team"
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
