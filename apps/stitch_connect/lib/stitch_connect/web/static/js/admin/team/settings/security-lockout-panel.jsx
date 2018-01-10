import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import isInteger from "lodash/isInteger";
import capitalize from "lodash/capitalize";
import { LOCKOUT_MINIMUM } from "lib/constants";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Security Lockout";
const description =
  "Stitch will automatically lockout after a specified period of inactivity. You can unlock it with your PIN or password.";

@inject("teamStore")
@observer
class SecurityLockoutPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      securityLockoutEnabled: false,
      hours: 0,
      minutes: 0,
      error: ""
    };
  }

  onChangeEnabled = evt => {
    this.setState({
      securityLockoutEnabled: evt.target.checked
    });
  };

  onChangeNumber = field => evt => {
    const { onError } = this.props;
    const value = evt.target.value;
    if (value < 0) {
      onError(`${capitalize(field)} should be positive number`);
      return;
    }
    if (!isInteger(value * 1)) {
      onError(`${capitalize(field)} should be integer`);
      return;
    }

    this.setState({ [field]: value * 1 });
  };

  onToggleEdit = () => {
    const { secondsToLockout, securityLockoutEnabled } = this.props.teamStore;
    const hours = Math.floor(secondsToLockout / 3600);
    const minutes = Math.floor((secondsToLockout % 3600) / 60);

    this.setState({
      securityLockoutEnabled,
      hours,
      minutes
    });
  };

  onSave = () => {
    const { securityLockoutEnabled, hours, minutes } = this.state;
    const { hideAlert, onSuccess, onError, teamStore } = this.props;
    const minutesToLockout = hours * 60 + minutes;

    if (minutesToLockout < LOCKOUT_MINIMUM) {
      onError(`Lock out time should not be smaller than ${LOCKOUT_MINIMUM} minute${LOCKOUT_MINIMUM > 1 ? 's' : ''}`);
      return Promise.resolve();
    }

    hideAlert();
    return teamStore
      .editSecurityLockout(
        securityLockoutEnabled,
        securityLockoutEnabled ? minutesToLockout * 60 : null
      )
      .then(() => {
        onSuccess("Security lockout setting has been updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  render() {
    const { securityLockoutEnabled, hours, minutes } = this.state;

    return (
      <SettingPanel
        title={title}
        description={description}
        onEdit={this.onToggleEdit}
        onSave={this.onSave}
      >
        <FormGroup>
          <Checkbox
            checked={securityLockoutEnabled}
            onChange={this.onChangeEnabled}
          >
            Enable Lockout
          </Checkbox>
          <Row>
            <Col
              componentClass={ControlLabel}
              className="lockout-time-label text-right"
              sm={5}
              md={5}
              lg={4}
            >
              Lockout inactivity interval:
              <span>hours:minutes</span>
            </Col>
            <Col sm={2}>
              <FormControl
                type="number"
                value={hours}
                onChange={this.onChangeNumber("hours")}
                disabled={!securityLockoutEnabled}
              />
              <ControlLabel>Hours</ControlLabel>
            </Col>
            <Col sm={2}>
              <FormControl
                type="number"
                value={minutes}
                onChange={this.onChangeNumber("minutes")}
                disabled={!securityLockoutEnabled}
              />
              <ControlLabel>Minutes</ControlLabel>
            </Col>
          </Row>
        </FormGroup>
      </SettingPanel>
    );
  }
}

SecurityLockoutPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default SecurityLockoutPanel;
