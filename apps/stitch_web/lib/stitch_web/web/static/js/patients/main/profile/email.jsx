import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("patientsStore")
@observer
class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      isEditing: false
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
      email: this.props.patientsStore.currentPatient.email || ""
    });
  };

  _onBlur = () => {
    const currentEmail = this.props.patientsStore.currentPatient.email;
    const { email } = this.state;

    if (email !== currentEmail && email !== "") {
      this._onSave();
    }

    this.setState({ isEditing: false });
  };

  _onSave = () => {
    const { email } = this.state;
    const { patientsStore } = this.props;
    const id = patientsStore.currentPatient.id;

    return patientsStore.saveAttribute("email")(id, email).then(() => {
      this.setState({ isEditing: false });
    });
  };

  _onChangeEmail = evt => this.setState({ email: evt.target.value });

  render() {
    const { email, isEditing } = this.state;

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">Email</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {this.props.patientsStore.currentPatient.email || (
                <span className="text-muted">+ Add email</span>
              )}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <div className="form-container">
              <FormControl
                autoFocus
                name="email"
                type="email"
                value={email}
                onChange={this._onChangeEmail}
                onKeyDown={this.onKeyDown}
                onFocus={e => {
                  const val = e.target.value;
                  e.target.value = "";
                  e.target.value = val;
                }}
                onBlur={this._onBlur}
                style={{
                  minWidth: "40px",
                  width: (email.length + 1) * 12 + "px",
                  maxWidth: "100%"
                }}
              />

              <Button className="btn-cancel" onClick={this._onBlur}>
                Cancel
              </Button>
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default Email;
