import React, { Component, PropTypes } from "react";

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
          <button
            className="btn-fancy btn-default pull-left"
            onClick={this._toggleEdit(false)}
          >
            Cancel
          </button>
          <button className="btn-fancy btn-primary pull-right">
            Save Changes
          </button>
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
          <button
            className="action-edit btn-fancy btn-default pull-right"
            onClick={this._toggleEdit(true)}
          >
            Edit
          </button>}
        <h3>
          {title}
        </h3>
        <p class="help-block">
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
