import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { AvatarUploader } from "common/components";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Profile Image";
const description =
  "Upload a profile image. This will be displayed when users view your information in Stitch.";

@inject("userStore", "uploadStore", "teamStore")
@observer
class ProfileImagePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileImgUrl: "",
      isUploading: false,
      isUploaded: false
    };
  }

  onUpload = image => {
    const {
      teamStore,
      userStore,
      uploadStore,
      onError,
      onSuccess
    } = this.props;
    if (image) {
      const fileName = `${teamStore.id}/${userStore.id}/${new Date().getTime()}.jpg`;
      this.setState({ isUploading: true });
      uploadStore
        .uploadAWS(image, "image/jpeg", fileName)
        .then(profileImgUrl => {
          onSuccess(
            "Image uploaded. Please click on save to update your image."
          );
          this.setState({
            profileImgUrl,
            isUploading: false,
            isUploaded: true
          });
        })
        .catch(() => {
          this.setState({ isUploading: false });
          onError("There was problem uploading the image.");
        });
    }
  };

  onToggleEdit = () => {
    this.setState({
      profileImgUrl: this.props.userStore.avatar,
      isUploaded: false
    });
  };

  onSave = () => {
    const { profileImgUrl, isUploaded } = this.state;
    const { onError, hideAlert, onSuccess, userStore } = this.props;
    hideAlert();

    if (profileImgUrl && isUploaded) {
      return userStore
        .saveProfileImg(profileImgUrl)
        .then(() => {
          onSuccess("Your profile image has been updated.");
        })
        .catch(() => {
          onError("There was problem saving the image.");
        });
    }
    return Promise.resolve(onError("Please upload an image first"));
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
      >
        <AvatarUploader
          className="profile-image-form"
          onUpload={this.onUpload}
          onError={onError}
          isUploading={isUploading}
          url={profileImgUrl}
          size={400}
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
