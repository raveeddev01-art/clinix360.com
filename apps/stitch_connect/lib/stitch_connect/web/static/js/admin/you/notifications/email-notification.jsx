import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Col from "react-bootstrap/lib/Col";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";

import SettingPanel from "../../components/setting-panel/setting-panel";

@inject("notificationStore")
@observer
class EmailNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setting: null
    };
  }

  onSave = () => {
    const { hideAlert, onSuccess, onError, notificationStore } = this.props;

    hideAlert();
    return notificationStore
      .updateEmailPref(this.state.setting)
      .then(() => {
        onSuccess("Email notification preference has been updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  onToggleEdit = () => {
    this.setState({
      setting: this.props.notificationStore.emailPref
    });
  };

  onChange = evt => {
    this.setState({ setting: evt.target.value });
  };

  render() {
    const { setting } = this.state;
    return (
      <SettingPanel
        title="Email Notifications"
        description="Your email notifications preferences for unread messages."
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <HelpBlock className="m-b-20">
          Stitch can send an email about new, unread messages you receive while
          you’re offline. You can set the frequency below. You won’t be notified
          twice about the same message.
        </HelpBlock>
        <Form horizontal>
          <FormGroup controlId="emailNotifications">
            <Col componentClass={ControlLabel} xs={4}>
              Send email about unread messages:
            </Col>
            <Col xs={4}>
              <FormControl
                componentClass="select"
                placeholder="select"
                value={setting}
                onChange={this.onChange}
              >
                <option value="never">Never</option>
                <option value="15min">Once every 15 minutes</option>
                <option value="hourly">Once every hour</option>
                <option value="daily">Once every day</option>
              </FormControl>
            </Col>
          </FormGroup>
        </Form>
      </SettingPanel>
    );
  }
}

EmailNotification.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default EmailNotification;
