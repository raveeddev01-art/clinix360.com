import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Team Name";
const description =
  "Your team's name will be shown in menus and headings. It will usually be or include the name of your organization.";

@inject("teamStore")
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
      teamName: this.props.teamStore.name
    });
  };

  _onChangeTeamName = evt => {
    this.setState({ teamName: evt.target.value });
  };

  _onSave = () => {
    this.props.teamStore.editTeamName(this.state.teamName);
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
        <FormGroup controlId="teamName">
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
