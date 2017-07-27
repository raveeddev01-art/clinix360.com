import React, { Component, PropTypes } from "react";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

class SettingPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  _toggleEdit = val => () => {
    this.setState({ isEditing: val });
  };

  _onSave = () => {
    this.props.onSave();
    this._toggleEdit(false);
  };

  _renderForm = () => {
    const { children, saveButtonText } = this.props;
    return (
      <div className="clearfix edit-form">
        {children}
        <div className="clearfix">
          <Button
            bsStyle="default"
            className="btn-fancy pull-left"
            onClick={this._toggleEdit(false)}
          >
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            className="btn-fancy pull-right"
            onClick={this._onSave}
          >
            {saveButtonText}
          </Button>
        </div>
      </div>
    );
  };

  _renderDescription = () => {
    const { description } = this.props;
    const items = Array.isArray(description) ? description : [description];
    return items.map((item, index) =>
      <HelpBlock key={`desc_${index}`}>
        {item}
      </HelpBlock>
    );
  };

  render() {
    const { isEditing } = this.state;
    const { title, description } = this.props;

    return (
      <div>
        {!isEditing &&
          <Button
            bsStyle="default"
            className="action-edit btn-fancy pull-right"
            onClick={this._toggleEdit(true)}
          >
            Edit
          </Button>}
        <h3>
          {title}
        </h3>
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
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  saveButtonText: PropTypes.string.isRequired
};

SettingPanel.defaultProps = {
  children: null,
  onSave: () => {},
  saveButtonText: "Save Changes"
};

export default SettingPanel;
