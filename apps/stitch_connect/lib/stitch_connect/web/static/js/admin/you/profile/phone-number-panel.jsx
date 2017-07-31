import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Phone Number";
const description =
  "Your phone number will be used for colleagues to contact you.";

@inject("userStore")
@observer
class PhoneNumberPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      phoneNumber: this.props.userStore.phone
    });
  };
  _onSave = () => {
    this.props.userStore.savePhone(this.state.phoneNumber);
  };

  _onChangePhoneNumber = evt =>
    this.setState({ phoneNumber: evt.target.value });

  render() {
    const { phoneNumber } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup bsSize="large">
          <ControlLabel>Mobile Phone</ControlLabel>
          <FormControl
            type="text"
            value={phoneNumber}
            onChange={this._onChangePhoneNumber}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default PhoneNumberPanel;
