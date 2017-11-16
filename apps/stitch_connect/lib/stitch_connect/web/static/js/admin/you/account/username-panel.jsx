import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Username";
const description =
  "Others will use this to mention and notify you in chat room conversation.";

@inject("userStore")
@observer
class UsernamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      username: this.props.userStore.username
    });
  };
  _onSave = () => {
    const { hideAlert, onSuccess, onError, userStore } = this.props;

    hideAlert();
    return userStore
      .saveUsername(this.state.username)
      .then(() => {
        onSuccess("Your username has been successfully updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

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
        <FormGroup bsSize="large">
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

UsernamePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default UsernamePanel;
