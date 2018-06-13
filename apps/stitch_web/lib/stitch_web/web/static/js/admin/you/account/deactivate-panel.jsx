import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";

import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Deactivate Panel";

@inject("userStore", "teamStore")
@observer
class DeactivatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmation: "",
      formValid: false
    };
  }

  onToggleEdit = () => {
    this.setState({
      confirmation: ""
    });
  };

  onSave = () => {
    const { onError, userStore } = this.props;

    userStore.deactivateAccount().catch(err => {
      onError(err.data.message);
    });
  };

  _onChangeConfirmation = e => {
    this.setState({
      confirmation: e.target.value,
      formValid: e.target.value === "CONFIRM"
    });
  };

  render() {
    const description = `If you no longer need your account on the ${this.props
      .teamStore.name} team, you can deactivate it here.`;

    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
        disableSave={!this.state.formValid}
        saveButtonText="Deactivate my account"
      >
        <FormGroup bsSize="large">
          <ControlLabel>Confirm</ControlLabel>
          <FormControl
            type="text"
            value={this.state.confirmation}
            placeholder="Type in CONFIRM before deleting."
            onChange={this._onChangeConfirmation}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

DeactivatePanel.propTypes = { onError: PropTypes.func.isRequired };

export default DeactivatePanel;
