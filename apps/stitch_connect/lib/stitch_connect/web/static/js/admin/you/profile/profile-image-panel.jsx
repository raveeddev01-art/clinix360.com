import React, { Component } from "react";
import Dropzone from "react-dropzone";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Profile Image";
const description =
  "Upload a profile image. This will be displayed when users view your information in Stitch.";

class ProfileImagePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      profileImgUrl: ""
    };
  }

  _onDrop = files => {
    console.log(files);
    this.setState({ files });
  };

  // @TODO handle upload
  _onUpload = () => {};

  // @TODO make a call to remove profile iamge
  _onRemove = () => {};

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
          <Dropzone
            className="profile-dropzone"
            multiple={false}
            accept="image/*"
            onDrop={this.onDrop}
          />
          <div className="profile-image-button-container">
            <Button bsSize="xsmall">Upload</Button>
            <Button bsSize="xsmall">Remove</Button>
          </div>
        </div>
      </SettingPanel>
    );
  }
}

export default ProfileImagePanel;
