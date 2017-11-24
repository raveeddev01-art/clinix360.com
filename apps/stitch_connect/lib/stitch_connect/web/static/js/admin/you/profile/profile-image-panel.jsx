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
      isUploading: false
    };
  }

  onCrop = profileImgUrl => {
    this.setState({ profileImgUrl });
  };

  onToggleEdit = () => {
    this.setState({
      profileImgUrl: this.props.userStore.avatar
    });
  };

  onSave = () => {
    const { profileImgUrl: image } = this.state;
    const {
      onError,
      hideAlert,
      onSuccess,
      userStore,
      teamStore,
      uploadStore
    } = this.props;
    hideAlert();

    if (image) {
      const fileName = `${teamStore.id}/${userStore.id}/${new Date().getTime()}.png`;
      this.setState({ isUploading: true });
      return uploadStore
        .uploadAWS(image, "image/png", fileName, { encoding: "base64" })
        .then(profileImgUrl => {
          return userStore.saveProfileImg(profileImgUrl);
        })
        .then(() => {
          onSuccess("Your profile image has been updated.");
          this.setState({
            isUploading: false
          });
        })
        .catch(() => {
          this.setState({ isUploading: false });
          onError("There was problem uploading the image.");
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
          onCrop={this.onCrop}
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
