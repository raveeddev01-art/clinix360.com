import React, { Component } from "react";
import PropTypes from "prop-types";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import { isValidUnicodeString } from "lib/utils";
import SettingPanel from "../../../admin/components/setting-panel/setting-panel";

class NamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: props.firstName,
      lastName: props.lastName
    };
  }

  _onToggleEdit = () => {
    this.setState({
      firstName: this.props.firstName,
      lastName: this.props.lastName
    });
  };

  _onSave = () => {
    const { firstName, lastName } = this.state;
    const { hideAlert, onSuccess, onError, saveName } = this.props;

    hideAlert();

    if (!isValidUnicodeString(firstName)) {
      return Promise.resolve(
        onError("First name contains invalid characters.")
      );
    }

    if (!isValidUnicodeString(lastName)) {
      return Promise.resolve(onError("Last name contains invalid characters."));
    }

    return saveName(firstName, lastName)
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
        title={this.props.title}
        description={this.props.description}
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

NamePanel.defaultProps = {
  title: "Name",
  description:
    "Your information will be shown alongside the messages you send in conversations."
};

NamePanel.propTypes = {
  description: PropTypes.string,
  firstName: PropTypes.string.isRequired,
  hideAlert: PropTypes.func.isRequired,
  lastName: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  saveName: PropTypes.func.isRequired,
  title: PropTypes.string
};

export default NamePanel;
