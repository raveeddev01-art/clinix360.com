import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Time zone";
const description = "";

@inject("userStore")
@observer
class TimezonePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timezone: ""
    };
  }

  _onToggle = () => {
    this.setState({
      timezone: this.props.userStore.timezone
    });
  };

  render() {
    const { timezone } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={() => null}
        onEdit={this._onToggle}
        disableSave
      >
        <FormGroup bsSize="large">
          <ControlLabel>Time zone</ControlLabel>
          <FormControl
            type="timezone"
            value={timezone}
            onChange={() => null}
            disabled
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default TimezonePanel;
