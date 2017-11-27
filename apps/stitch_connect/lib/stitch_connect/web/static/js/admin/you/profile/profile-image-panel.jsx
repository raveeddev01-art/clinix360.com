import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { AvatarUploader } from "common/components";
import { confirm } from "common/modals";
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
      isCropped: false,
      isUploading: false
    };
  }

  onCrop = profileImgUrl => {
    this.setState({ profileImgUrl, isCropped: true });
  };

  onToggleEdit = () => {
    this.setState({
      profileImgUrl: this.props.userStore.avatar
    });
  };

  onSave = () => {
    const { profileImgUrl: image, isCropped } = this.state;
    const {
      onError,
      hideAlert,
      onSuccess,
      userStore,
      teamStore,
      uploadStore
    } = this.props;
    hideAlert();

    if (isCropped) {
      const fileName = `${teamStore.id}_${userStore.id}_${new Date().getTime()}.png`;
      this.setState({ isUploading: true });
      return uploadStore
        .uploadAWS(image, "image/png", fileName)
        .then(profileImgUrl => {
          return userStore.saveProfileImg(profileImgUrl);
        })
        .then(() => {
          onSuccess("Your profile image has been updated.");
          this.setState({
            isUploading: false,
            profileImgUrl: userStore.avatar,
            isCropped: false
          });
        })
        .catch(() => {
          this.setState({ isUploading: false });
          onError("There was problem uploading the image.");
        });
    }

    return Promise.resolve(onError("Please upload an image first"));
  };

  onDelete = () => {
    const { onError, onSuccess, userStore } = this.props;
    confirm({
      title: "Delete Profile Image",
      message: "Are you sure you want to delete your profile image?",
      okLabel: "Delete"
    }).then(() => {
      this.setState({ isUploading: true });
      userStore
        .deleteProfileImg()
        .then(() => {
          onSuccess("Your profile image has been deleted.");
          this.setState({
            isUploading: false,
            profileImgUrl: userStore.avatar,
            isCropped: false
          });
        })
        .catch(() => {
          onError("There was problem deleting your profile image.");
          this.setState({
            isUploading: false
          });
        });
    });
  };

  render() {
    const { profileImgUrl, isUploading, isCropped } = this.state;
    const { onError, userStore } = this.props;

    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <AvatarUploader
          className="profile-image-form"
          onCrop={this.onCrop}
          onDelete={this.onDelete}
          hasAvatar={userStore.hasAvatar}
          onError={onError}
          isCropped={isCropped}
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
