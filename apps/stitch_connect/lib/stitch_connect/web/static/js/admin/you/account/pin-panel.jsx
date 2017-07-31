import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "PIN";
const description =
  "Set your PIN. This will be used to resume Stitch after inactivity lockouts.";

@inject("userStore")
@observer
class UsernamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      pin: ""
    });
  };
  _onSave = () => {
    this.props.userStore.savePIN(this.state.pin);
  };

  _onChangePIN = evt => this.setState({ pin: evt.target.value });

  render() {
    const { pin } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup>
          <ControlLabel>PIN</ControlLabel>
          <FormControl
            type="password"
            placeholder="0000"
            maxLength={4}
            value={pin}
            onChange={this._onChangePIN}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default UsernamePanel;
