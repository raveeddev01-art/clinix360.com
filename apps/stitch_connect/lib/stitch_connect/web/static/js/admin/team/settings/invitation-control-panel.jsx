import React, { Component } from "react";
import { observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Checkbox from "react-bootstrap/lib/Checkbox";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";
import TeamStore from "../../stores/team_store";

const title = "Invitation Control";
const description = [
  "Control who on your team can invite new members to join.",
  "By default, anyone on your team can invite a new member to join. To restrict invitation ability to admins only, uncheck the box below."
];

@observer
class InvitationControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openInvitationsEnabled: false
    };
  }

  _onCheckboxChange = evt => {
    this.setState({
      openInvitationsEnabled: evt.target.checked
    });
  };

  _onToggleEdit = () => {
    this.setState({
      openInvitationsEnabled: TeamStore.instance.openInvitationsEnabled
    });
  };

  _onSave = () => {
    TeamStore.instance.updateOpenInvitation(this.state.openInvitationsEnabled);
  };

  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        onEdit={this._onToggleEdit}
        onSave={this._onSave}
      >
        <FormGroup>
          <Checkbox
            checked={this.state.openInvitationsEnabled}
            onChange={this._onCheckboxChange}
          >
            Allow all users to invite new members to the team
          </Checkbox>
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default InvitationControlPanel;
