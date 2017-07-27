import React, { Component } from "react";
import { observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Checkbox from "react-bootstrap/lib/Checkbox";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Invitation Control";
const description = [
  "Control who on your team can invite new members to join.",
  "By default, anyone on your team can invite a new member to join. To restrict invitation ability to admins only, uncheck the box below."
];

class InvitationControlPanel extends Component {
  render() {
    return (
      <SettingPanel title={title} description={description}>
        <FormGroup>
          <Checkbox checked readOnly>
            Allow all users to invite new members to the team
          </Checkbox>
        </FormGroup>
      </SettingPanel>
    );
  }
}

export default InvitationControlPanel;
