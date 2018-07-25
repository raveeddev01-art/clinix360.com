import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import { isValidUnicodeString } from "lib/utils";

@inject("patientsStore")
@observer
class FirstName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      isEditing: false,
      hasError: false,
      errorMessage: ""
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
    const currentFirstName = this.props.patientsStore.currentPatient.first_name;
    const { firstName } = this.state;

    if (firstName !== currentFirstName) {
      this._onSave();
    } else {
      this._onCancel();
    }
  };

  _onCancel = () => {
    this.setState({ isEditing: false, hasError: false });
  };

  _onSave = () => {
    const { firstName } = this.state;
    const { patientsStore } = this.props;
    const id = patientsStore.currentPatient.id;

    if (!firstName) {
      this.setState({
        hasError: true,
        errorMessage: "First name can't be blank"
      });
    }

    if (firstName && isValidUnicodeString(firstName)) {
      return patientsStore.saveFirstName(id, firstName).then(() => {
        this.setState({ hasError: false });
        this.setState({ isEditing: false });
      });
    }

    return this.setState({
      hasError: true,
      errorMessage: "First name contains invalid characters."
    });
  };

  _onChangeFirstName = evt => this.setState({ firstName: evt.target.value });

  render() {
    const { firstName, isEditing, hasError } = this.state;

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
            <div>
              <div className="form-container">
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
                  style={{
                    minWidth: "40px",
                    width: (firstName.length + 1) * 12 + "px",
                    maxWidth: "100%"
                  }}
                />

                <Button className="btn-cancel" onClick={this._onBlur}>
                  Cancel
                </Button>
              </div>

              {hasError && (
                <HelpBlock>
                  <i className="fa fa-warning" /> {this.state.errorMessage}
                </HelpBlock>
              )}
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default FirstName;
