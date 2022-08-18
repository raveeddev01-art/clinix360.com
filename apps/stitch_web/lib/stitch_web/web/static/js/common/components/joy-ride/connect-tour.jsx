import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Joyride, { ACTIONS, EVENTS } from "react-joyride/es";

import JoyRideToolTip from "./tooltip";

@inject(
  "uploadStore",
  "sidemenuStore",
  "groupsStore",
  "messageStore",
  "userStore"
)
@observer
class ConnectTour extends Component {
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
      callback: this.callback,
      disableOverlayClose: true,
      tooltipComponent: JoyRideToolTip,
      run: props.userStore.connectTourStatus === "pending"
    };
  }

  steps = () => {
    const steps = [
      {
        placement: "center",
        disableBeacon: true,
        title: "Welcome to InvoChat",
        target: ".message-form-action-item",
        content: (
          <p>
            Message your team, from any device. InvoChat is HIPAA
            compliant and free to use with an unlimited number of people.
          </p>
        )
      },
      {
        placement: "right",
        disableBeacon: true,
        title: "Create Room",
        target: ".create-room-button",
        content: (
          <p>
            Conversations in InvoChat take place in <b>rooms</b>. Create
            rooms for common topics of discussion.
          </p>
        )
      },
      {
        placement: "top",
        disableBeacon: true,
        title: "Send Messages",
        target: ".message-input-wrapper",
        content: (
          <p>
            Send messages by typing into the message input box and pressing{" "}
            <b>Enter</b>.
          </p>
        )
      },
      {
        placement: "top",
        disableBeacon: true,
        title: "Upload Files",
        target: ".message-form-action-item",
        content: (
          <p>
            You can upload all types of files, including documents,
            presentations, videos, images, and more.
          </p>
        )
      }
    ];

    if (this.props.userStore.canInvite) {
      steps.push({
        placement: "right",
        disableBeacon: true,
        title: "Invite Members",
        target: ".invite-link",
        content: (
          <p>
            Invite your team members into InvoChat, so you can bring all your
            communication into one place.
          </p>
        )
      });
    }

    return steps;
  };

  callback = data => {
    const { callback } = this.props;
    const { action, index, type } = data;

    if (type === EVENTS.TOUR_END && this.state.run) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
    } else if (action === ACTIONS.CLOSE && this.state.run) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
      this.props.userStore.markConnectTourCompleted();
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
    return <Joyride {...this.state} {...this.props} />;
  }
}

export default ConnectTour;
