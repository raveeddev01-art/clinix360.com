import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Time Zone";
const description = "Your current time zone. We use this when we send emails.";

@inject("userStore")
@observer
class TimezonePanel extends Component {
  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={() => null}
        onEdit={this._onToggle}
        disableSave
      >
        <FormGroup bsSize="large">
          <ControlLabel>Time Zone</ControlLabel>
          <FormControl
            type="timezone"
            value={this.props.userStore.timezone}
            onChange={() => null}
            disabled
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default TimezonePanel;
