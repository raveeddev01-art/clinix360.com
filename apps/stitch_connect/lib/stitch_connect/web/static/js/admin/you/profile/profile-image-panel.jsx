import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Dropzone from "react-dropzone";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Profile Image";
const description =
  "Upload a profile image. This will be displayed when users view your information in Stitch.";

// @TODO support cropping modal
@inject("userStore", "imageStore", "teamStore")
@observer
class ProfileImagePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      preview: null,
      profileImgUrl: ""
    };
  }

  componentWillUnmount() {
    this._onRemove();
  }

  _onDrop = files => {
    this.setState({ image: files[0] });
  };

  _onUpload = () => {
    const { image } = this.state;
    const { teamStore, userStore, imageStore } = this.props;
    if (image) {
      const fileName = `${teamStore.id}/${userStore.id}/${image.name}`;
      imageStore.uploadImage(image, fileName).then(profileImgUrl => {
        notify.show(
          "Image uploaded. Please click on save to update your image."
        );
        this.setState({ profileImgUrl });
      });
    }
  };

  _onRemove = () => {
    // remove preview to avoid memroy leak
    if (this.state.image) {
      window.URL.revokeObjectURL(this.state.image.preview);
    }
    this.setState({ image: null, profileImgUrl: "" });
  };

  _onToggleEdit = () => {
    this.setState({
      profileImgUrl: ""
    });
  };

  _onSave = () => {
    const { profileImgUrl } = this.state;
    if (profileImgUrl) {
      this.props.userStore.saveProfileImg(profileImgUrl);
    } else {
      notify.show("Please upload an image first", "error");
    }
  };

  render() {
    const { image, profileImgUrl } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
        disableSave={!profileImgUrl}
      >
        <div className="profile-image-form">
          <Dropzone
            className="profile-dropzone"
            multiple={false}
            accept="image/*"
            onDrop={this._onDrop}
          >
            {!image && <p>Click here or drag an image here.</p>}
            {image &&
              <img
                alt="profile logo preview"
                src={image.preview}
                className="profile-img-prevew"
              />}
          </Dropzone>
          <div className="profile-image-button-container">
            <Button bsSize="xsmall" onClick={this._onUpload} disabled={!image}>
              Upload
            </Button>
            <Button bsSize="xsmall" onClick={this._onRemove} disabled={!image}>
              Remove
            </Button>
          </div>
        </div>
      </SettingPanel>
    );
  }
}

export default ProfileImagePanel;
