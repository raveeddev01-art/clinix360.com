import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import { isValidUnicodeString } from "lib/utils";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Name";
const description =
  "Your information will be shown alongside the messages you send in conversations.";

@inject("userStore")
@observer
class NamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      firstName: this.props.userStore.firstName,
      lastName: this.props.userStore.lastName
    });
  };

  _onSave = () => {
    const { firstName, lastName } = this.state;
    const { hideAlert, onSuccess, onError, userStore } = this.props;

    hideAlert();

    if (!isValidUnicodeString(firstName)) {
      return Promise.resolve(
        onError("First name contains invalid characters.")
      );
    }

    if (!isValidUnicodeString(lastName)) {
      return Promise.resolve(onError("Last name contains invalid characters."));
    }

    return userStore
      .saveName(firstName, lastName)
      .then(() => {
        onSuccess("Your name has been successfully updated.");
      })
      .catch(err => {
        const message = err.data.message
          .replace("first_name", "First name")
          .replace("last_name", "Last name");

        onError(message);
      });
  };

  _onChangeFirstName = evt => this.setState({ firstName: evt.target.value });
  _onChangeLastName = evt => this.setState({ lastName: evt.target.value });

  render() {
    const { firstName, lastName } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <Row>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>First Name</ControlLabel>
            <FormControl
              type="text"
              bsSize="large"
              value={firstName}
              onChange={this._onChangeFirstName}
            />
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>Last Name</ControlLabel>
            <FormControl
              type="text"
              bsSize="large"
              value={lastName}
              onChange={this._onChangeLastName}
            />
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}

NamePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default NamePanel;
