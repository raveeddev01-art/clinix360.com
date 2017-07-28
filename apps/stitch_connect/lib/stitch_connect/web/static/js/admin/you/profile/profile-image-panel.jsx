import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Profile Image";
const description =
  "Upload a profile image. This will be displayed when users view your information in Stitch.";

class PhoneNumberPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileImgUrl: ""
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <div className="profile-image-form">
          <div>Dropzone placeholder</div>
          <div>
            <Button bsSize="xsmall">Remove</Button>
            <Button bsSize="xsmall">Upload</Button>
          </div>
        </div>
      </SettingPanel>
    );
  }
}

export default PhoneNumberPanel;
