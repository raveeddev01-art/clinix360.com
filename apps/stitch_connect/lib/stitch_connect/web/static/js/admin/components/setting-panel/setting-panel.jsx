import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

class SettingPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      isSaving: false,
      disableSave: props.disableSave
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disableSave !== this.props.disableSave) {
      this.setState({ disableSave: nextProps.disableSave });
    }
  }

  _toggleEdit = val => () => {
    this.props.onEdit(val);
    this.setState({ isEditing: val });
  };

  _onSave = () => {
    this.setState({ isSaving: true });
    this.props.onSave().then(() => {
      this.setState({ isSaving: false });
    });
    this._toggleEdit(false);
  };

  _renderForm = () => {
    const { children, saveButtonText } = this.props;
    const { isSaving } = this.state;

    return (
      <div className="clearfix edit-form">
        {children}
        {saveButtonText !== "" && (
          <div className="clearfix">
            <Button
              bsStyle="primary"
              className="btn-fancy"
              onClick={this._onSave}
              disabled={isSaving || this.state.disableSave}
            >
              {saveButtonText}
              {this._renderLoadingIcon()}
            </Button>
          </div>
        )}
      </div>
    );
  };

  _renderDescription = () => {
    const { description } = this.props;
    const items = Array.isArray(description) ? description : [description];
    return items.map((item, index) => (
      <HelpBlock key={`desc_${index}`}>{item}</HelpBlock>
    ));
  };

  _renderLoadingIcon = () => {
    const { isSaving } = this.state;
    return isSaving ? (
      <i className="fa fa-circle-o-notch fa-spin fa-fw on-right" />
    ) : null;
  };

  render() {
    const { isEditing } = this.state;
    const { title } = this.props;

    return (
      <div className="panel-settings">
        <Button
          bsStyle="default"
          className="action-edit btn-fancy pull-right"
          onClick={this._toggleEdit(!isEditing)}
        >
          {!isEditing ? "Open" : "Close"}
        </Button>
        <h3>{title}</h3>
        {this._renderDescription()}
        {isEditing && this._renderForm()}
      </div>
    );
  }
}

SettingPanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  saveButtonText: PropTypes.string.isRequired,
  disableSave: PropTypes.bool.isRequired
};

SettingPanel.defaultProps = {
  children: null,
  onSave: () => {},
  onEdit: () => {},
  description: "",
  saveButtonText: "Save",
  disableSave: false
};

export default SettingPanel;
