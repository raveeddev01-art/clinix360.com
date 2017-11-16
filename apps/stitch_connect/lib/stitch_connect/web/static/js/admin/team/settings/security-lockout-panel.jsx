import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import leftPad from "left-pad";
import moment from "moment";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Security Lockout";
const description =
  "Stitch will automatically lockout after a specified period of inactivity. You can unlock it with your PIN or password.";

const lockoutTimes = (function() {
  const timeArray = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 15; j <= 60; j += 15) {
      if (j === 60) {
        timeArray.push(`${leftPad(i + 1, 2, 0)}:00`);
      } else {
        timeArray.push(`${leftPad(i, 2, 0)}:${j}`);
      }
    }
  }

  return timeArray.map(duration => ({
    duration,
    seconds: moment.duration(duration).asSeconds()
  }));
})();

// @TODO update select control to select2 after it is added to common components
@inject("teamStore")
@observer
class SecurityLockoutPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      securityLockoutEnabled: false,
      secondsToLockout: null
    };
  }

  _onChangeEnabled = evt => {
    this.setState({
      securityLockoutEnabled: evt.target.checked
    });
  };

  _onChangeLockout = evt => {
    this.setState({
      secondsToLockout: evt.target.value
    });
  };

  _onToggleEdit = () => {
    this.setState({
      securityLockoutEnabled: this.props.teamStore.securityLockoutEnabled,
      secondsToLockout:
        this.props.teamStore.secondsToLockout || lockoutTimes[0].seconds
    });
  };

  _onSave = () => {
    const { securityLockoutEnabled, secondsToLockout } = this.state;
    const { hideAlert, onSuccess, onError, teamStore } = this.props;

    hideAlert();
    return teamStore
      .editSecurityLockout(
        securityLockoutEnabled,
        securityLockoutEnabled ? secondsToLockout : null
      )
      .then(() => {
        onSuccess("Security lockout setting has been updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  render() {
    const { securityLockoutEnabled, secondsToLockout } = this.state;

    return (
      <SettingPanel
        title={title}
        description={description}
        onEdit={this._onToggleEdit}
        onSave={this._onSave}
      >
        <FormGroup>
          <Checkbox
            checked={securityLockoutEnabled}
            onChange={this._onChangeEnabled}
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
            <Col sm={3} md={3} lg={2}>
              <FormControl
                componentClass="select"
                value={secondsToLockout}
                onChange={this._onChangeLockout}
                disabled={!securityLockoutEnabled}
              >
                {lockoutTimes.map(val => (
                  <option key={val.duration} value={val.seconds}>
                    {val.duration}
                  </option>
                ))}
              </FormControl>
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
