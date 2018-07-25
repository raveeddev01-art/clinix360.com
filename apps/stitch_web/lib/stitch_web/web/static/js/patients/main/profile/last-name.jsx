import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import { isValidUnicodeString } from "lib/utils";

@inject("patientsStore")
@observer
class LastName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastName: "",
      isEditing: false,
      hasError: false
    };
  }

  onKeyDown = evt => {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      this._onSave();
    }

    if (evt.keyCode === 27) {
      this.setState({
        isEditing: false
      });
    }
  };

  _onToggleEdit = () => {
    this.setState({
      isEditing: true,
      lastName: this.props.patientsStore.currentPatient.last_name
    });
  };

  _onBlur = () => {
    const currentLastName = this.props.patientsStore.currentPatient.last_name;
    const { lastName } = this.state;

    if (lastName === currentLastName) {
      this._onCancel();
    } else {
      this._onSave();
    }
  };

  _onCancel = () => {
    this.setState({ isEditing: false, hasError: false });
  };

  _onSave = () => {
    const { lastName } = this.state;
    const { patientsStore } = this.props;
    const id = patientsStore.currentPatient.id;

    if (isValidUnicodeString(lastName)) {
      return patientsStore.saveAttribute("last_name")(id, lastName).then(() => {
        this.setState({ isEditing: false });
      });
    }

    return this.setState({ hasError: true });
  };

  _onChangeLastName = evt => this.setState({ lastName: evt.target.value });

  render() {
    const { lastName, isEditing, hasError } = this.state;

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
            <div>
              <div className="form-container">
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
                  style={{
                    minWidth: "40px",
                    width: (lastName.length + 1) * 12 + "px",
                    maxWidth: "100%"
                  }}
                />

                <Button className="btn-cancel" onClick={this._onCancel}>
                  Cancel
                </Button>
              </div>

              {hasError && (
                <HelpBlock>
                  <i className="fa fa-warning" /> First name contains invalid
                  characters.
                </HelpBlock>
              )}
            </div>
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
