import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
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
import { confirm } from "common/modals";

@inject("usersStore", "uploadStore", "teamStore")
@observer
class EditProfileModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: props.show,
      profileImgUrl: props.user.avatar,
      isCropped: false,
      isUploading: false
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
        hasAvatar: !!nextProps.user.avatar
      });
    }
  }

  onCrop = profileImgUrl => {
    this.setState({ profileImgUrl, isCropped: true });
    this.onSaveProfileImage();
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
    const { usersStore, user: { id: userId } } = this.props;
    confirm({
      title: "Delete Profile Image",
      message: "Are you sure you want to delete this user's profile image?",
      okLabel: "Delete"
    }).then(() => {
      this.setState({ isUploading: true });
      usersStore
        .deleteProfileImg(userId)
        .then(avatar => {
          this.showSuccess("The user's profile image has been deleted.");
          this.setState({
            isUploading: false,
            profileImgUrl: avatar,
            isCropped: false,
            hasAvatar: false
          });
        })
        .catch(() => {
          this.showError(
            "There was problem deleting the user's profile image."
          );
          this.setState({
            isUploading: false
          });
        });
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
    const { show } = this.state;
    const { alertMessage, alertVisible, alertStyle } = this.state;
    const { toggle, user } = this.props;
    const { profileImgUrl, isUploading, isCropped, hasAvatar } = this.state;

    return (
      <Modal
        className="edit-profile-modal"
        show={show}
        onHide={toggle}
        bsSize="large"
      >
        <Modal.Header>
          <Modal.Title>Edit Profile: {this.state.full_name}</Modal.Title>
          <a role="link" onClick={toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          <Row>
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
            <Col sm={6}>
              <h4>
                <strong>Profile Photo</strong>
              </h4>
              <AvatarUploader
                className="profile-image-form"
                onCrop={this.onCrop}
                onDelete={this.onDeleteProfileImage}
                hasAvatar={hasAvatar}
                onError={this.showError}
                isCropped={isCropped}
                isUploading={isUploading}
                url={profileImgUrl}
                size={400}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="m-u-50">
          <Button bsSize="large" bsStyle="default" onClick={toggle}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.onSubmit}>
            Save Settings
          </Button>
        </Modal.Footer>
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
