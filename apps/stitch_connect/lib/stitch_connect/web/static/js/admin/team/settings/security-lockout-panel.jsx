import React, { Component } from "react";
import { observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import leftPad from "left-pad";
import moment from "moment";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";
import TeamStore from "../../stores/team_store";

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
      securityLockoutEnabled: TeamStore.instance.securityLockoutEnabled,
      secondsToLockout:
        TeamStore.instance.securityLockoutEnabled || lockoutTimes[0].seconds
    });
  };

  _onSave = () => {
    const { securityLockoutEnabled, secondsToLockout } = this.state;
    TeamStore.instance.editSecurityLockout(
      securityLockoutEnabled,
      securityLockoutEnabled ? secondsToLockout * 1 : null
    );
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
                defaultValue={lockoutTimes[0].seconds}
              >
                {lockoutTimes.map(val =>
                  <option key={val.duration} value={val.seconds}>
                    {val.duration}
                  </option>
                )}
              </FormControl>
            </Col>
          </Row>
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default SecurityLockoutPanel;
