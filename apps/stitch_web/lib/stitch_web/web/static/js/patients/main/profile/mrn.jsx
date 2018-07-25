import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("patientsStore")
@observer
class Mrn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mrn: "",
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
      mrn: this.props.patientsStore.currentPatient.mrn
    });
  };

  _onBlur = () => {
    const currentMrn = this.props.patientsStore.currentPatient.mrn;
    const { mrn } = this.state;

    if (mrn !== currentMrn) {
      this._onSave();
    }

    this.setState({ isEditing: false });
  };

  _onSave = () => {
    const { mrn } = this.state;
    const { patientsStore } = this.props;
    const id = patientsStore.currentPatient.id;

    return patientsStore.saveMrn(id, mrn).then(() => {
      this.setState({ isEditing: false });
    });
  };

  _onChangeMrn = evt => this.setState({ mrn: evt.target.value });

  render() {
    const { mrn, isEditing } = this.state;

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">MRN</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {this.props.patientsStore.currentPatient.mrn}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <div className="form-container">
              <FormControl
                autoFocus
                name="mrn"
                type="text"
                value={mrn}
                onChange={this._onChangeMrn}
                onKeyDown={this.onKeyDown}
                onFocus={e => {
                  const val = e.target.value;
                  e.target.value = "";
                  e.target.value = val;
                }}
                onBlur={this._onBlur}
                style={{
                  minWidth: "40px",
                  width: (mrn.length + 1) * 12 + "px",
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

export default Mrn;
