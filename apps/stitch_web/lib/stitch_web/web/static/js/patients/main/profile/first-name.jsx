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
class FirstName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
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
      firstName: this.props.patientsStore.currentPatient.first_name
    });
  };

  _onBlur = () => {
    this.setState({
      isEditing: false
    });
  };

  _onSave = () => {
    const { firstName } = this.state;
    const { hideAlert, onSuccess, onError, patientsStore } = this.props;
    const id = this.props.patientsStore.currentPatient.id;

    hideAlert();

    if (!isValidUnicodeString(firstName)) {
      return Promise.resolve(
        onError("First name contains invalid characters.")
      );
    }

    return patientsStore
      .saveFirstName(id, firstName)
      .then(() => {
        onSuccess("Patient name has been successfully updated.");
        this.setState({ isEditing: false });
      })
      .catch(err => {
        const message = err.data.message.replace("first_name", "First name");
        onError(message);
      });
  };

  _onChangeFirstName = evt => this.setState({ firstName: evt.target.value });

  render() {
    const { firstName, isEditing } = this.state;

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">First Name</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {this.props.patientsStore.currentPatient.first_name}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <FormControl
              autoFocus
              name="first_name"
              type="text"
              value={firstName}
              onChange={this._onChangeFirstName}
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

FirstName.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default FirstName;
