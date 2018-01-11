import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import cx from "classnames";
import pick from "lodash/pick";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Alert from "react-bootstrap/lib/Alert";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import { AvatarUploader } from "common/components";

@inject("usersStore", "uploadStore", "teamStore")
@observer
class EditProfileModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: props.show,
      profileImgUrl: props.user.avatar,
      isCropped: false,
      isCropping: false,
      isUploading: false,
      isDeletingImg: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({
        show: nextProps.show,
        full_name: `${nextProps.user.first_name} ${nextProps.user.last_name}`,
        first_name: nextProps.user.first_name || "",
        last_name: nextProps.user.last_name || "",
        phone_number: nextProps.user.phone || "",
        title: nextProps.user.title || "",
        alertVisible: false,
        hasAvatar: !!nextProps.user.avatar,
        isDeletingImg: false
      });
    }
  }

  onCrop = profileImgUrl => {
    this.setState({ profileImgUrl, isCropped: true });
    this.onSaveProfileImage();
  };

  onCropping = isCropping => {
    this.setState({
      isCropping,
      alertVisible: false
    });
  };

  onSaveProfileImage = () => {
    const { profileImgUrl: image, isCropped } = this.state;
    const { user: { id: userId } } = this.props;

    const { usersStore, teamStore, uploadStore } = this.props;

    this.hideAlert();

    if (isCropped) {
      const fileName = `${teamStore.id}_${userId}_${new Date().getTime()}.png`;
      this.setState({ isUploading: true });
      return uploadStore
        .uploadAWS(image, "image/png", fileName)
        .then(profileImgUrl => {
          return usersStore.saveProfileImg(userId, profileImgUrl);
        })
        .then(avatar => {
          this.showSuccess("The user's profile image has been updated.");
          this.setState({
            isUploading: false,
            profileImgUrl: avatar,
            isCropped: false,
            isCropping: false,
            hasAvatar: true
          });
        })
        .catch(() => {
          this.setState({ isUploading: false });
          this.showError("There was problem uploading the image.");
        });
    }

    return Promise.resolve(this.showError("Please upload an image first"));
  };

  onDeleteProfileImage = () => {
    this.setState({
      isDeletingImg: true
    });
  };

  onSubmit = evt => {
    evt.preventDefault();

    this.hideAlert();

    const userData = pick(
      this.state,
      "first_name",
      "last_name",
      "phone_number",
      "title"
    );

    const { user, usersStore, onSuccess, toggle } = this.props;
    usersStore
      .saveUserData(user.id, userData)
      .then(() => {
        toggle();
        onSuccess(
          `Profile details have been updated for ${userData.first_name} ${userData.last_name}.`
        );
      })
      .catch(() => {
        this.showError(
          "Profile update has failed, please enter required fields."
        );
      });
  };

  closeModal = () => {
    if (this.state.isUploading) return;
    this.props.toggle();
  };

  cancelDeleteOrCroppingImg = () => {
    if (this.state.isUploading) return;
    this.setState({
      isDeletingImg: false,
      isCropping: false
    });
  };

  deleteProfileImg = () => {
    const { usersStore, user: { id: userId } } = this.props;
    this.setState({ isUploading: true });
    usersStore
      .deleteProfileImg(userId)
      .then(avatar => {
        this.showSuccess("The user's profile image has been deleted.");
        this.setState({
          isUploading: false,
          profileImgUrl: avatar,
          isCropped: false,
          hasAvatar: false,
          isDeletingImg: false
        });
      })
      .catch(() => {
        this.showError("There was problem deleting the user's profile image.");
        this.setState({
          isUploading: false,
          isDeletingImg: false
        });
      });
  };

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  showError = error => {
    this.setState({
      alertVisible: true,
      alertStyle: "danger",
      alertMessage: error
    });
  };

  showSuccess = message => {
    this.setState({
      alertVisible: true,
      alertStyle: "success",
      alertMessage: message
    });
  };

  handleChange = event => {
    const target = event.target;

    this.setState({
      [target.name]: target.value
    });
  };

  render() {
    const { toggle } = this.props;
    const {
      show,
      alertMessage,
      alertVisible,
      alertStyle,
      profileImgUrl,
      isUploading,
      isCropped,
      isCropping,
      isDeletingImg,
      hasAvatar
    } = this.state;

    const titleStyle = cx({ "text-center": isDeletingImg || isCropping });

    const modalTitle = isCropping
      ? "Crop your photo"
      : isDeletingImg
        ? "Remove Profile Photo"
        : `Edit Profile: ${this.state.full_name}`;

    return (
      <Modal
        className="edit-profile-modal"
        show={show}
        onHide={this.closeModal}
        bsSize="large"
      >
        <Modal.Header>
          {(isDeletingImg || isCropping) && (
              <a role="link" onClick={this.cancelDeleteOrCroppingImg}>
                <i className="fa fa-arrow-left" />
              </a>
            )}
          <Modal.Title className={titleStyle}>{modalTitle}</Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          <Row>
            {!isCropping && (
              <Col sm={6}>
                <Form
                  className="edit-profile-form"
                  onSubmit={this.onSubmit}
                  noValidate
                >
                  <FormGroup bsSize="large">
                    <ControlLabel>First Name</ControlLabel>
                    <FormControl
                      name="first_name"
                      required
                      autoFocus
                      type="text"
                      value={this.state.first_name}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormGroup bsSize="large">
                    <ControlLabel>Last Name</ControlLabel>
                    <FormControl
                      name="last_name"
                      required
                      type="text"
                      value={this.state.last_name}
                      onChange={this.handleChange}
                    />
                  </FormGroup>

                  <FormGroup bsSize="large">
                    <ControlLabel>Phone Number</ControlLabel>
                    <FormControl
                      name="phone_number"
                      required
                      type="text"
                      value={this.state.phone_number}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormGroup bsSize="large">
                    <ControlLabel>Title</ControlLabel>
                    <FormControl
                      name="title"
                      type="text"
                      value={this.state.title}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Form>
              </Col>
            )}
            <Col sm={6} smOffset={isCropping ? 3 : 0}>
              {!isCropping && (
                <h4>
                  <strong>Profile Photo</strong>
                </h4>
              )}
              <AvatarUploader
                className="profile-image-form"
                onCrop={this.onCrop}
                onCropping={this.onCropping}
                onDelete={this.onDeleteProfileImage}
                hasAvatar={hasAvatar}
                onError={this.showError}
                isCropped={isCropped}
                isCropping={isCropping}
                isUploading={isUploading}
                url={profileImgUrl}
                size={400}
              />
            </Col>
          </Row>

          {isDeletingImg && (
            <div className="profile-img-delete-prompt">
              <p>Are you sure you want to delete this user's profile image?</p>
              <div className="buttons">
                <Button
                  bsSize="large"
                  bsStyle="default"
                  onClick={this.cancelDeleteOrCroppingImg}
                >
                  Cancel
                </Button>
                <Button
                  bsSize="large"
                  bsStyle="primary"
                  onClick={this.deleteProfileImg}
                >
                  Yes, remove photo
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>

        {!isDeletingImg &&
          !isCropping && (
            <Modal.Footer className="m-u-50">
              <Button bsSize="large" bsStyle="default" onClick={toggle}>
                Cancel
              </Button>
              <Button bsSize="large" bsStyle="primary" onClick={this.onSubmit}>
                Save Settings
              </Button>
            </Modal.Footer>
          )}
      </Modal>
    );
  }
}

EditProfileModal.propTypes = {
  user: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default EditProfileModal;
