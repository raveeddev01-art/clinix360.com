import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { AvatarUploader } from "common/components";
import SettingPanel from "../../components/setting-panel/setting-panel";

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
      profileImgUrl: "",
      isUploading: false
    };
  }

  onUpload = image => {
    const { teamStore, userStore, imageStore, onError, onSuccess } = this.props;
    if (image) {
      const fileName = `${teamStore.id}/${userStore.id}/1.jpg`; // @TODO randomize name
      this.setState({ isUploading: true });
      imageStore
        .uploadImage(image, fileName)
        .then(profileImgUrl => {
          onSuccess(
            "Image uploaded. Please click on save to update your image."
          );
          this.setState({ profileImgUrl, isUploading: false });
        })
        .catch(err => {
          onError(err.data.message);
          this.setState({ isUploading: false });
        });
    }
  };

  onToggleEdit = () => {
    this.setState({
      profileImgUrl: ""
    });
  };

  onSave = () => {
    const { profileImgUrl } = this.state;
    const { onError, hideAlert } = this.props;
    hideAlert();

    if (profileImgUrl) {
      this.props.userStore.saveProfileImg(profileImgUrl);
    } else {
      onError("Please upload an image first");
    }
  };

  render() {
    const { profileImgUrl, isUploading } = this.state;
    const { onError } = this.props;

    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
        disableSave={!profileImgUrl}
      >
        <AvatarUploader
          className="profile-image-form"
          onUpload={this.onUpload}
          onError={onError}
          isUploading={isUploading}
          url={profileImgUrl}
          size={200}
        />
      </SettingPanel>
    );
  }
}

ProfileImagePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default ProfileImagePanel;
