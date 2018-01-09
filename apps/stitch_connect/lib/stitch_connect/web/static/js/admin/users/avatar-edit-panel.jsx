import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { AvatarUploader } from "common/components";
import { confirm } from "common/modals";

@inject("usersStore", "uploadStore", "teamStore")
@observer
class AvatarEditPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileImgUrl: props.user.avatar,
      isCropped: false,
      isUploading: false
    };
  }

  onCrop = profileImgUrl => {
    this.setState({ profileImgUrl, isCropped: true });
    this.onSave();
  };

  onSave = () => {
    const { profileImgUrl: image, isCropped } = this.state;
    const { user: { id: userId } } = this.props;

    const {
      onError,
      hideAlert,
      onSuccess,
      usersStore,
      teamStore,
      uploadStore
    } = this.props;
    hideAlert();

    if (isCropped) {
      const fileName = `${teamStore.id}_${userId}_${new Date().getTime()}.png`;
      this.setState({ isUploading: true });
      return uploadStore
        .uploadAWS(image, "image/png", fileName)
        .then(profileImgUrl => {
          return usersStore.saveProfileImg(userId, profileImgUrl);
        })
        .then(avatar => {
          onSuccess("The user's profile image has been updated.");
          this.setState({
            isUploading: false,
            profileImgUrl: avatar,
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
    const { onError, onSuccess, usersStore, user: { id: userId } } = this.props;
    confirm({
      title: "Delete Profile Image",
      message: "Are you sure you want to delete this user's profile image?",
      okLabel: "Delete"
    }).then(() => {
      this.setState({ isUploading: true });
      usersStore
        .deleteProfileImg(userId)
        .then(avatar => {
          onSuccess("The user's profile image has been deleted.");
          this.setState({
            isUploading: false,
            profileImgUrl: avatar,
            isCropped: false
          });
        })
        .catch(() => {
          onError("There was problem deleting the user's profile image.");
          this.setState({
            isUploading: false
          });
        });
    });
  };

  render() {
    const { profileImgUrl, isUploading, isCropped } = this.state;
    const { onError, user } = this.props;
    const hasAvatar = !!user.avatar;

    return (
      <div>
        <AvatarUploader
          className="profile-image-form"
          onCrop={this.onCrop}
          onDelete={this.onDelete}
          hasAvatar={hasAvatar}
          onError={onError}
          isCropped={isCropped}
          isUploading={isUploading}
          url={profileImgUrl}
          size={400}
        />
      </div>
    );
  }
}

AvatarEditPanel.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default AvatarEditPanel;
