import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Radio from "react-bootstrap/lib/Radio";

import { NOTIFICATION_PREFERENCES } from "lib/constants";
import SettingPanel from "../../components/setting-panel/setting-panel";

@inject("notificationStore")
@observer
class DesktopNotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pref: ""
    };
  }

  onToggleEdit = () => {
    const { notificationStore } = this.props;

    this.setState({
      pref: notificationStore.desktopPref
    });
  };

  onChange = pref => () => {
    this.setState({ pref });
  };

  onSave = () => {
    const { hideAlert, onSuccess, onError, notificationStore } = this.props;

    hideAlert();

    return notificationStore
      .updateDesktopPref(this.state.pref)
      .then(() => {
        onSuccess("Desktop notification preference has been updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  render() {
    const { pref } = this.state;

    return (
      <SettingPanel
        title="Desktop Notifications"
        description="These settings apply to all groups and conversations in Stictch Connect, but are overriden by channel specific settings below."
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <HelpBlock className="m-b-20" />
        <div className="radio-group notifications">
          {NOTIFICATION_PREFERENCES.map(p => (
            <Radio
              key={p.value}
              name="desktop-pref"
              checked={pref === p.value}
              onChange={this.onChange(p.value)}
            >
              <span className="radio-span">
                <h5>{p.title}</h5>
                <p className="m-b-0">{p.description}</p>
              </span>
            </Radio>
          ))}
        </div>
      </SettingPanel>
    );
  }
}

DesktopNotification.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default DesktopNotification;
