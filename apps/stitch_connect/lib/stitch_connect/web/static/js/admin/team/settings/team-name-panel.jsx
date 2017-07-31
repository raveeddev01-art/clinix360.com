import React, { Component } from "react";
import { observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";
import TeamStore from "../../stores/team_store";

const title = "Team Name";
const description =
  "Your team's name will be shown in menus and headings. It will usually be or include the name of your organization.";

@observer
class TeamNamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamName: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      teamName: TeamStore.instance.name
    });
  };

  _onChangeTeamName = evt => {
    this.setState({ teamName: evt.target.value });
  };

  _onSave = () => {
    TeamStore.instance.editTeamName(this.state.teamName);
  };

  render() {
    const { teamName } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup controlId="teamName" bsSize="large">
          <ControlLabel>Team Name</ControlLabel>
          <FormControl
            type="text"
            value={teamName}
            onChange={this._onChangeTeamName}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default TeamNamePanel;
