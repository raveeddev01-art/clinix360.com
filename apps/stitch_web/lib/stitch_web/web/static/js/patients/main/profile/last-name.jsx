import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import { isValidUnicodeString } from "lib/utils";

@inject("patientsStore")
@observer
class LastName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastName: "",
      isEditing: false
    };
  }

  onKeyDown = evt => {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      this._onSave();
    }

    if (evt.keyCode === 27) {
      this._onBlur();
    }
  };

  _onToggleEdit = () => {
    this.setState({
      isEditing: true,
      lastName: this.props.patientsStore.currentPatient.last_name
    });
  };

  _onBlur = () => {
    this.setState({
      isEditing: false
    });
  };

  _onSave = () => {
    const { lastName } = this.state;
    const { hideAlert, onSuccess, onError, patientsStore } = this.props;
    const id = this.props.patientsStore.currentPatient.id;

    hideAlert();

    if (!isValidUnicodeString(lastName)) {
      return Promise.resolve(onError("Last name contains invalid characters."));
    }

    return patientsStore
      .saveLastName(id, lastName)
      .then(() => {
        onSuccess("Patient name has been successfully updated.");
        this.setState({ isEditing: false });
      })
      .catch(err => {
        const message = err.data.message.replace("last_name", "Last name");
        onError(message);
      });
  };

  _onChangeLastName = evt => this.setState({ lastName: evt.target.value });

  render() {
    const { lastName, isEditing } = this.state;

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">Last Name</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {this.props.patientsStore.currentPatient.last_name}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <FormControl
              autoFocus
              name="first_name"
              type="text"
              value={lastName}
              onChange={this._onChangeLastName}
              onKeyDown={this.onKeyDown}
              onFocus={e => {
                const val = e.target.value;
                e.target.value = "";
                e.target.value = val;
              }}
              onBlur={this._onBlur}
            />
          )}
        </Col>
      </Row>
    );
  }
}

LastName.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default LastName;
