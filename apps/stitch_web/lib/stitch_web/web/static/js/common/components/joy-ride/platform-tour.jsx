import Joyride from "react-joyride";
import JoyRideToolTip from './tooltip';
import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { ACTIONS, EVENTS } from "react-joyride/es/constants";

@inject(
  "uploadStore",
  "sidemenuStore",
  "groupsStore",
  "messageStore",
  "userStore"
)
@observer
class PlatformTour extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
      loading: false,
      continuous: true,
      steps: this.steps(),
      showSkipButton: true,
      spotlightClicks: false,
      disableCloseOnEsc: true,
      scrollToFirstStep: true,
      disableOverlayClose: true,
      tooltipComponent: JoyRideToolTip,
      callback: this.callback.bind(this),
      run: props.userStore.platformTourStatus === 'Pending',
    };
  }

  steps = () => {
    const steps = [{
      placement: "center",
      disableBeacon: true,
      title: "Welcome to Stitch",
      target: ".admin-content-wrapper",
      content: <p>Stitch is a care coordination platform for healthcare teams.
        Communicate, write notes, track tasks and upload files on any device.</p>
    }, {
      placement: "left",
      disableBeacon: true,
      title: "Launch Products",
      target: ".admin-products-wrapper",
      content: <p>Choose which products you want to launch and get started
        with our apps: Connect, Engage, and Manage.</p>
    }, {
      placement: "left",
      disableBeacon: true,
      title: "Personal Settings",
      target: ".admin-account-wrapper",
      content: <p>Manage and view your account, profile, notifications, and more from here.</p>
    }, {
      placement: "left",
      disableBeacon: true,
      title: "Administration Settings",
      target: ".admin-admin-wrapper",
      content: <p>Manage and view your Carespace settings, security, membership, and more.</p>
    }, {
      placement: "right",
      disableBeacon: true,
      title: "Stitch Controls",
      target: ".switcher__bottom",
      content: <p>Sign out, lock your app, and invite more members.</p>
    }];

    return steps;
  }

  callback = data => {
    const { callback } = this.props;
    const { action, index, type } = data;

    if (type === EVENTS.TOUR_END && this.state.run) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
    } else if (action === ACTIONS.CLOSE && this.state.run) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
      this.props.userStore.markPlatformTourCompleted();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update state to advance the tour
      this.debug(EVENTS.STEP_AFTER);
      this.debug(index);
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    } else if (type === EVENTS.TOOLTIP_CLOSE) {
      this.setState({ stepIndex: index + 1 });
    }

    if (typeof callback === "function") {
      callback(data);
    } else {
      this.debug(data, type);
    }
  };

  debug(params, group = false) {
    if (this.props.debug) {
      group && console.group(group);
      console.log(params);
      group && console.groupEnd();
    }
  }

  render() {
    return (<Joyride {...this.state} {...this.props} />);
  }
}

export default PlatformTour;
