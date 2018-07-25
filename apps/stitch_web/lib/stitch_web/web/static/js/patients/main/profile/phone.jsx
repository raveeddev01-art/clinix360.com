import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("patientsStore")
@observer
class Phone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
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
      phone: this.props.patientsStore.currentPatient.phone || ""
    });
  };

  _onBlur = () => {
    const currentPhone = this.props.patientsStore.currentPatient.phone;
    const { phone } = this.state;

    if (phone !== currentPhone && phone !== "") {
      this._onSave();
    }

    this.setState({
      isEditing: false
    });
  };

  _onSave = () => {
    const { phone } = this.state;
    const { patientsStore } = this.props;
    const id = this.props.patientsStore.currentPatient.id;

    return patientsStore.saveAttribute("phone")(id, phone).then(() => {
      this.setState({ isEditing: false });
    });
  };

  _onChangePhone = evt => this.setState({ phone: evt.target.value });

  render() {
    const { phone, isEditing } = this.state;

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">Phone</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {this.props.patientsStore.currentPatient.phone || (
                <span className="text-muted">+ Add phone number</span>
              )}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <div className="form-container">
              <FormControl
                autoFocus
                name="phone"
                type="text"
                value={phone}
                onChange={this._onChangePhone}
                onKeyDown={this.onKeyDown}
                onFocus={e => {
                  const val = e.target.value;
                  e.target.value = "";
                  e.target.value = val;
                }}
                onBlur={this._onBlur}
                style={{
                  minWidth: "40px",
                  width: (phone.length + 1) * 9 + "px",
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

export default Phone;
