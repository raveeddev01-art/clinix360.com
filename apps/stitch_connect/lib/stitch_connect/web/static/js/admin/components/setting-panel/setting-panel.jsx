import React, { Component, PropTypes } from "react";
import Button from "react-bootstrap/lib/Button";

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
    const { children } = this.props;
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
            Save Changes
          </Button>
        </div>
      </div>
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
        <p className="help-block">
          {description}
        </p>
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
  description: PropTypes.string.isRequired
};

SettingPanel.defaultProps = {
  children: null,
  onSave: () => {}
};

export default SettingPanel;
