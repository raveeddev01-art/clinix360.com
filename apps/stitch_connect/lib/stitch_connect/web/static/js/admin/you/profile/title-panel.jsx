import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const panelTitle = "Title";
const description = "Your title will be displayed in profile.";

class TitlePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: ""
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

  _onChangeTitle = evt => this.setState({ title: evt.target.value });

  render() {
    const { title } = this.state;
    return (
      <SettingPanel
        title={panelTitle}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            type="text"
            value={title}
            onChange={this._onChangeTitle}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default TitlePanel;
