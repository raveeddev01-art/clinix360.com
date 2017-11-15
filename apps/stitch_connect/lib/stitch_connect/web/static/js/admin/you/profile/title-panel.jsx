import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import SettingPanel from "../../components/setting-panel/setting-panel";

const panelTitle = "Title";
const description = "Your title will be displayed in profile.";

@inject("userStore")
@observer
class TitlePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: ""
    };
  }

  _onToggleEdit = () => {
    this.setState({
      title: this.props.userStore.title
    });
  };

  _onSave = () => {
    const { hideAlert, onSuccess } = this.props;

    hideAlert();
    return this.props.userStore.saveTitle(this.state.title).then(() => {
      onSuccess("Your title has been successfully updated.");
    });
  };

  _onChangeTitle = evt => this.setState({ title: evt.target.value });

  render() {
    const { title } = this.state;
    return (
      <SettingPanel
        title={panelTitle}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <FormGroup bsSize="large">
          <ControlLabel>Title</ControlLabel>
          <FormControl
            type="text"
            value={title}
            onChange={this._onChangeTitle}
          />
        </FormGroup>
      </SettingPanel>
    );
  }
}

TitlePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default TitlePanel;
