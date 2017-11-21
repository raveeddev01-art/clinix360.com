import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

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
    const { hideAlert, onSuccess, onError, userStore } = this.props;

    hideAlert();
    return userStore
      .saveEmail(this.state.email)
      .then(() => {
        onSuccess("Your email has been successfully updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
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
        disableSave
      >
        <FormGroup bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type="email"
            value={email}
            onChange={this._onChangeEmail}
            disabled
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

EmailPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default EmailPanel;
