import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Email";
const description =
  "We'll use this email address to send you any offline notifications or occasional updates.";

@inject("userStore")
@observer
class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      email: this.props.userStore.email
    });
  };
  _onSave = () => {
    this.props.userStore.saveEmail(this.state.email);
  };

  _onChangeEmail = evt => this.setState({ email: evt.target.value });

  render() {
    const { email } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type="email"
            value={email}
            onChange={this._onChangeEmail}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default EmailPanel;
