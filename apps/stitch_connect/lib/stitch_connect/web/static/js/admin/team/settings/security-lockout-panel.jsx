import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import leftPad from "left-pad";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

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
  return timeArray;
})();

// @TODO update select control to select2 after it is added to common components
class SecurityLockoutPanel extends Component {
  render() {
    return (
      <SettingPanel title={title} description={description}>
        <FormGroup>
          <Checkbox checked readOnly>
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
              <FormControl componentClass="select">
                {lockoutTimes.map(val =>
                  <option key={val} value={val}>
                    {val}
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
