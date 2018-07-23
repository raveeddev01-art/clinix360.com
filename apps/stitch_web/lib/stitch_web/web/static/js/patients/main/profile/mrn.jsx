import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

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
      this._onBlur();
    }
  };

  _onToggleEdit = () => {
    this.setState({
      isEditing: true,
      mrn: this.props.patientsStore.currentPatient.mrn
    });
  };

  _onBlur = () => {
    this.setState({
      isEditing: false
    });
  };

  _onSave = () => {
    const { mrn } = this.state;
    const { hideAlert, onSuccess, onError, patientsStore } = this.props;
    const id = this.props.patientsStore.currentPatient.id;

    hideAlert();

    return patientsStore
      .saveMrn(id, mrn)
      .then(() => {
        onSuccess("Patient MRN has been successfully updated.");
        this.setState({ isEditing: false });
      })
      .catch(err => {
        onError(err.data.message);
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
            />
          )}
        </Col>
      </Row>
    );
  }
}

Mrn.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default Mrn;
