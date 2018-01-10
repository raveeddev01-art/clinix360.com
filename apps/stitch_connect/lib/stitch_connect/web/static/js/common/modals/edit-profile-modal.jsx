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

@inject("usersStore", "uploadStore", "teamStore")
@observer
class EditProfileModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: props.show
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
        title: nextProps.user.title || ""
      });
    }
  }

  onSubmit = evt => {
    evt.preventDefault();

    this.setState({
      alertVisible: false
    });

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
        this.setState({
          alertVisible: true,
          alertStyle: "danger",
          alertMessage:
            "Profile update has failed, please enter required fields."
        });
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
    const { toggle } = this.props;

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
            <Col sm={7}>
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
            <Col sm={5}>
              <h4>
                <strong>Profile Photo</strong>
              </h4>
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
