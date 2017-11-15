import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

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
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    return post(`/api/v1/users/validate-phone-number`, {
      body: { phone_number: this.state.phoneNumber },
      hideNotify: true
    })
      .then(() => {
        return this.props.userStore
          .savePhone(this.state.phoneNumber)
          .then(() => {
            onSuccess("Your phone number has been successfully updated.");
          });
      })
      .catch(err => {
        onError(err.data.message);
      });
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
            placeholder="(123) 456-789"
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

PhoneNumberPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PhoneNumberPanel;
