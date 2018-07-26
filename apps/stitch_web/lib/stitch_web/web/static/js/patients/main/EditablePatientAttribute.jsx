import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import cx from "classnames";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import { isValidUnicodeString } from "lib/utils";

@inject("patientsStore")
@observer
class EditablePatientAttribute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attrVal: "",
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
      attrVal:
        this.props.patientsStore.currentPatient[this.props.attrName] || ""
    });
  };

  _onFocus = e => {
    const val = e.target.value;
    e.target.value = "";
    e.target.value = val;
  };

  _onBlur = () => {
    const currentAttrVal = this.props.patientsStore.currentPatient[
      this.props.attrName
    ];
    const { attrVal, isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    if (attrVal !== currentAttrVal) {
      this._onSave();
    } else {
      this._onCancel();
    }
  };

  _onCancel = () => {
    this.setState({ isEditing: false, hasError: false });
  };

  _onSave = () => {
    const { attrVal } = this.state;
    const {
      patientsStore,
      attrDisplayName,
      attrName,
      validateName,
      validatePhone,
      isRequired
    } = this.props;
    const id = this.props.patientsStore.currentPatient.id;

    if (isRequired && attrVal === "") {
      return this.setState({
        hasError: true,
        errorMessage: `${attrDisplayName} can't be blank.`
      });
    }

    if (validateName && !isValidUnicodeString(attrVal)) {
      return this.setState({
        hasError: true,
        errorMessage: `${attrDisplayName} contains invalid characters.`
      });
    }

    if (validateName && isValidUnicodeString(attrVal)) {
      return patientsStore.saveAttribute(attrName)(id, attrVal).then(() => {
        this.setState({ hasError: false, isEditing: false });
      });
    }

    if (validatePhone) {
      return post(`/api/v1/users/validate-phone-number`, {
        body: { phone_number: attrVal },
        hideNotify: true
      })
        .then(() => {
          return patientsStore.saveAttribute(attrName)(id, attrVal).then(() => {
            this.setState({ hasError: false, isEditing: false });
          });
        })
        .catch(err => {
          this.setState({ hasError: true, errorMessage: err.data.message });
        });
    }

    return patientsStore.saveAttribute(attrName)(id, attrVal).then(() => {
      this.setState({ isEditing: false });
    });
  };

  _onChange = evt => this.setState({ attrVal: evt.target.value });

  render() {
    const { attrDisplayName, attrName, buttonText, patientsStore } = this.props;
    const { attrVal, isEditing, hasError, errorMessage } = this.state;

    const inputClass = cx({
      hasError
    });

    return (
      <Row className="profile-row">
        <Col sm={3}>
          <div className="text-muted">{attrDisplayName}</div>
        </Col>
        <Col sm={9}>
          {!isEditing ? (
            <Button onClick={this._onToggleEdit}>
              {patientsStore.currentPatient[attrName] || (
                <span className="text-muted">{buttonText}</span>
              )}
              <i className="fa fa-edit" />
            </Button>
          ) : (
            <div>
              <div className="form-container">
                <FormControl
                  autoFocus
                  name={attrName}
                  type={attrName === "email" ? "email" : "text"}
                  value={attrVal}
                  className={inputClass}
                  onChange={this._onChange}
                  onKeyDown={this.onKeyDown}
                  onFocus={this._onFocus}
                  onBlur={() => setTimeout(this._onBlur, 150)}
                  style={{
                    minWidth: "60px",
                    width: (attrVal.length + 2) * 12 + "px",
                    maxWidth: "100%"
                  }}
                />

                <Button className="btn-cancel" onClick={this._onCancel}>
                  Cancel
                </Button>
              </div>

              {hasError && <HelpBlock>{errorMessage}</HelpBlock>}
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

EditablePatientAttribute.defaultProps = {
  validateName: false,
  validatePhone: false,
  isRequired: false
};

EditablePatientAttribute.propTypes = {
  attrName: PropTypes.string.isRequired,
  attrDisplayName: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  validateName: PropTypes.bool,
  validatePhone: PropTypes.bool,
  isRequired: PropTypes.bool
};

export default EditablePatientAttribute;
