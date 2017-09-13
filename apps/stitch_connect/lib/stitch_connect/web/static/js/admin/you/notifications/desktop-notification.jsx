import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Radio from "react-bootstrap/lib/Radio";

import SettingPanel from "../../components/setting-panel/setting-panel";

@inject("notificationStore")
@observer
class DesktopNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setting: null
    };
  }

  onToggleEdit = () => {
    this.setState({
      setting: this.props.notificationStore.desktopPreference
    });
  };

  onChange = val => () => {
    this.setState({ setting: val });
  };

  onSave = () => {
    const { notificationStore } = this.props;
    notificationStore.updateDesktopPreference(this.state.setting).then(() => {
      notify.show("Desktop notification preference updated");
    });
  };

  render() {
    const { setting } = this.state;

    return (
      <SettingPanel
        title="Desktop Notifications"
        description="These settings apply to all groups and conversations in Stictch Connect, but are overriden by channel specific settings below."
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <HelpBlock className="m-b-20" />
        <div className="radio-group notifications">
          <Radio
            name="radioGroup"
            checked={setting === "everything"}
            onChange={this.onChange("everything")}
          >
            <span className="radio-span">
              <h5>Everything</h5>
              <p className="m-b-0">
                You will be notified for every new message.
              </p>
            </span>
          </Radio>

          <Radio
            name="radioGroup"
            checked={setting === "mentions"}
            onChange={this.onChange("mentions")}
          >
            <span className="radio-span">
              <h5>Mentions</h5>
              <p className="m-b-0">
                You will be notified only when a team member mentions you.
              </p>
            </span>
          </Radio>

          <Radio
            name="radioGroup"
            checked={setting === "nothing"}
            onChange={this.onChange("nothing")}
          >
            <span className="radio-span">
              <h5>Nothing</h5>
              <p className="m-b-0">
                You will not receive notifications, but will continue to see a
                badge count for unread messages.
              </p>
            </span>
          </Radio>
        </div>
      </SettingPanel>
    );
  }
}

export default DesktopNotification;
