import React, { Component } from "react";
import PropTypes from "prop-types";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../../admin/components/setting-panel/setting-panel";

class PhoneNumberPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { phoneNumber: props.phoneNumber };
  }

  _onToggleEdit = () => {
    this.setState({ phoneNumber: this.props.phoneNumber });
  };

  _onSave = () => {
    const { hideAlert, onSuccess, onError, savePhone } = this.props;
    hideAlert();
    return post(`/api/v1/users/validate-phone-number`, {
      body: { phone_number: this.state.phoneNumber },
      hideNotify: true
    })
      .then(() => {
        return savePhone(this.state.phoneNumber).then(() => {
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
        title={this.props.title}
        description={this.props.description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup bsSize="large">
          <ControlLabel>Phone Number</ControlLabel>
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

PhoneNumberPanel.defaultProps = {
  title: "Phone Number",
  description: "Your phone number will be used for colleagues to contact you."
};

PhoneNumberPanel.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  description: PropTypes.string,
  title: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired,
  savePhone: PropTypes.func.isRequired
};

export default PhoneNumberPanel;
