import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Username";
const description =
  "Others will use this to mention and notify you in chat room conversation.";

class UsernamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ""
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

  _onChangeUsername = evt => this.setState({ username: evt.target.value });

  render() {
    const { username } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            type="text"
            value={username}
            onChange={this._onChangeUsername}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default UsernamePanel;
