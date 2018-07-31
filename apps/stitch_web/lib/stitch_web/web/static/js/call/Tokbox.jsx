/* Let CRA handle linting for sample app */
import React, { Component } from "react";
import classNames from "classnames";

import AccCore from "opentok-accelerator-core";
import { observer, inject } from "mobx-react";
import { Avatar } from "common/components";
import moment from "moment";

import { CALL_AUTO_END_AFTER_MS } from "../lib/constants";

const otCoreOptions = {
  credentials: {
    apiKey: "",
    sessionId: "",
    token: ""
  },
  // A container can either be a query selector or an HTML Element
  streamContainers(pubSub, type, data, stream) {
    return {
      publisher: {
        camera: "#cameraPublisherContainer",
        screen: "#screenPublisherContainer"
      },
      subscriber: {
        camera: "#cameraSubscriberContainer",
        screen: "#screenSubscriberContainer"
      }
    }[pubSub][type];
  },
  controlsContainer: "#controls",
  // packages: ['screenSharing', 'annotation'],
  communication: {
    callProperties: {
      showControls: true,
      publishAudio: true,
      publishVideo: false,
      style: {
        nameDisplayMode: "on",
        buttonDisplayMode: "off",
        audioLevelDisplayMode: "off",
        videoDisabledDisplayMode: "off"
      }
    }
  },
  screenSharing: {
    extensionID: "plocfffmbcclpdifaikiikgplfnepkpo",
    annotation: true,
    externalWindow: false,
    dev: true,
    screenProperties: {
      insertMode: "append",
      width: "100%",
      height: "100%",
      showControls: false,
      style: {
        buttonDisplayMode: "off"
      },
      videoSource: "window",
      fitMode: "contain" // Using default
    }
  },
  annotation: {
    absoluteParent: {
      publisher: ".ots-video-container",
      subscriber: ".ots-video-container"
    }
  }
};

/**
 * Build classes for container elements based on state
 * @param {Object} state
 */
const containerClasses = state => {
  const { active, meta, localAudioEnabled, localVideoEnabled } = state;
  const sharingScreen = meta ? !!meta.publisher.screen : false;
  const viewingSharedScreen = meta ? meta.subscriber.screen : false;
  const activeCameraSubscribers = meta ? meta.subscriber.camera : 0;
  const activeCameraSubscribersGt2 = activeCameraSubscribers > 2;
  const activeCameraSubscribersOdd = activeCameraSubscribers % 2;
  const screenshareActive = viewingSharedScreen || sharingScreen;
  return {
    controlClass: classNames("ots-control-container", { hidden: !active }),
    localAudioClass: classNames("ots-video-control circle audio", {
      hidden: !active,
      muted: !localAudioEnabled
    }),
    localVideoClass: classNames("ots-video-control circle video", {
      hidden: !active,
      muted: !localVideoEnabled
    }),
    localCallClass: classNames("ots-video-control circle end-call", {
      hidden: !active
    }),
    cameraPublisherClass: classNames("video-container small", {
      hidden: !active
    }),
    screenPublisherClass: classNames("video-container", {
      hidden: !active || !sharingScreen
    }),
    cameraSubscriberClass: classNames(
      "video-container",
      { hidden: !active || !activeCameraSubscribers },
      { "active-gt2": activeCameraSubscribersGt2 && !screenshareActive },
      { "active-odd": activeCameraSubscribersOdd && !screenshareActive },
      { small: screenshareActive }
    ),
    screenSubscriberClass: classNames("video-container", {
      hidden: !viewingSharedScreen || !active
    }),
    groupWaitingTextClass: classNames("group-waiting-text", {
      hidden: activeCameraSubscribers > 0 || viewingSharedScreen
    }),
    dmWaitingTextClass: classNames("dm-waiting-text", {
      hidden: activeCameraSubscribers > 0 || viewingSharedScreen
    })
  };
};

@inject("userStore", "usersStore", "groupsStore", "callStore")
@observer
class Tokbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      publishers: null,
      subscribers: null,
      meta: {
        publisher: { camera: 0, screen: 0, total: 0 },
        subscriber: { camera: 0, screen: 0, total: 0 }
      },
      localAudioEnabled: true,
      localVideoEnabled: false,
      showTimer: false,
      currentTime: "00:00",
      connectionCount: 0
    };

    this.timer = moment("2000-01-01")
      .startOf("day")
      .seconds(0);

    this.startCall = this.startCall.bind(this);
    this.endCall = this.endCall.bind(this);
    this.toggleLocalAudio = this.toggleLocalAudio.bind(this);
    this.toggleLocalVideo = this.toggleLocalVideo.bind(this);
  }

  componentDidMount() {
    if (!this.props.callStore.isActiveCall) {
      return;
    }

    const { callStore } = this.props;
    const { credentials } = callStore;
    this.otCore = new AccCore({ ...otCoreOptions, credentials });
    this.otCore.connect().then(() => this.startCall());
    this.addEventListeners();
    this.handleAutoEnd();
  }

  getUserAvatar({ stream: { connection: { data } } }) {
    try {
      const { usersStore } = this.props;
      const { user_id } = JSON.parse(data);
      const user = usersStore.getUserById(user_id);
      return user.grey_avatar;
    } catch (e) {
      return false;
    }
  }

  setStreamAvatar({ subscriber: e }) {
    const { subscribers, streamMap } = this.otCore.state();
    const subId = streamMap[e.stream.id];
    const subscriber = subscribers.camera[subId] || subscribers.screen[subId];
    const avatar = this.getUserAvatar(e);

    if (e.stream.hasVideo || !avatar) {
      subscriber.setStyle("backgroundImageURI", subscriber.getImgData());
    } else {
      subscriber.setStyle("backgroundImageURI", avatar);
    }
  }

  handleAutoEnd() {
    if (this.props.callStore.isDM) {
      this.timeout = setTimeout(() => {
        this.otCore.endCall();
        this.otCore.disconnect();
        this.setState({ active: false });
        this.props.callStore.missedCall();
      }, CALL_AUTO_END_AFTER_MS);
    }
  }

  handleConnectionCreated(e) {
    let { connectionCount } = this.state;
    connectionCount += 1;
    this.setState({ connectionCount });

    if (connectionCount > 1) {
      clearTimeout(this.timeout);

      setInterval(() => {
        this.timer.add(1, "seconds");
        this.setState({ currentTime: this.timer.format("mm:ss") });
      }, 1000);

      this.setState({ showTimer: true });
    }
  }

  handleConnectionDestroyed(e) {
    let { connectionCount } = this.state;
    connectionCount -= 1;
    this.setState({ connectionCount });

    if (connectionCount < 2) {
      this.endCall();
    }
  }

  addEventListeners() {
    const events = [
      "subscribeToCamera",
      "unsubscribeFromCamera",
      "subscribeToScreen",
      "unsubscribeFromScreen",
      "startScreenShare",
      "endScreenShare"
    ];

    events.forEach(event =>
      this.otCore.on(event, ({ publishers, subscribers, meta }) => {
        this.setState({ publishers, subscribers, meta });
      })
    );

    this.otCore.on("subscribeToCamera", this.setStreamAvatar.bind(this));
    this.otCore.on(
      "connectionCreated",
      this.handleConnectionCreated.bind(this)
    );
    this.otCore.on(
      "connectionDestroyed",
      this.handleConnectionDestroyed.bind(this)
    );
  }

  startCall() {
    const { style } = otCoreOptions.communication.callProperties;

    this.otCore
      .startCall({
        name: this.props.userStore.fullName,
        style: {
          ...style,
          backgroundImageURI: this.props.userStore.avatar
        }
      })
      .then(({ publishers, subscribers, meta }) => {
        this.props.callStore.setConnected();
        this.setState({ publishers, subscribers, meta, active: true });
      })
      .catch(error => console.log(error));
  }

  endCall() {
    this.otCore.endCall();
    this.otCore.disconnect();
    this.setState({ active: false });
    window.close();
  }

  toggleLocalAudio() {
    this.otCore.toggleLocalAudio(!this.state.localAudioEnabled);
    this.setState({ localAudioEnabled: !this.state.localAudioEnabled });
  }

  toggleLocalVideo() {
    this.otCore.toggleLocalVideo(!this.state.localVideoEnabled);
    this.setState({ localVideoEnabled: !this.state.localVideoEnabled });
  }

  renderNotActiveCall() {
    const { status } = this.props.callStore;

    return (
      <div id="loading-screen-wrapper">
        <div className="text-center">
          {status === "missed" && (
            <h3>
              This call is missed, your team member might be available at this
              time.
            </h3>
          )}
          {status === "declined" && (
            <h3>
              This call is declined, your team member might be busy at this
              time.
            </h3>
          )}
          {status === "ended" && (
            <h3>
              This call is ended, you can initiate another call to reach your
              team.
            </h3>
          )}
          <button className="btn btn-default btn-sm" onClick={window.close}>
            Close
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (!this.props.callStore.isActiveCall) {
      return this.renderNotActiveCall();
    }

    const {
      localAudioClass,
      localVideoClass,
      localCallClass,
      controlClass,
      cameraPublisherClass,
      screenPublisherClass,
      cameraSubscriberClass,
      screenSubscriberClass,
      groupWaitingTextClass,
      dmWaitingTextClass
    } = containerClasses(this.state);

    const { callStore, groupsStore } = this.props;
    const group = groupsStore.getGroupById(callStore.groupId);
    const otherUser = (group || { users: [] }).users.filter(
      u => u.id !== currentUser.id
    )[0];

    return (
      <div className="ots-main">
        {this.state.showTimer && (
          <div className="timer">{this.state.currentTime}</div>
        )}
        <div className="ots-video-container">
          <div id="cameraPublisherContainer" className={cameraPublisherClass} />
          <div id="screenPublisherContainer" className={screenPublisherClass} />
          <div
            id="cameraSubscriberContainer"
            className={cameraSubscriberClass}
          />
          <div
            id="screenSubscriberContainer"
            className={screenSubscriberClass}
          />
          {group &&
            group.type !== "dm" && (
              <div className={groupWaitingTextClass}>
                <span className="p1">
                  You've started and shared a call
                  {group.type === "regular" ? " in " : " with "}
                  {group ? group.name : "the group"}
                </span>
                <span className="p2">
                  Waiting for team members to join the call...
                </span>
              </div>
            )}

          {otherUser &&
            group.type === "dm" && (
              <div className={dmWaitingTextClass}>
                <Avatar user={otherUser} />
                <span className="p2">Calling {otherUser.full_name} ...</span>
              </div>
            )}
        </div>
        <div id="controls" className={controlClass}>
          <div className={localAudioClass} onClick={this.toggleLocalAudio} />
          <div className={localVideoClass} onClick={this.toggleLocalVideo} />
          <div className={localCallClass} onClick={this.endCall} />
        </div>
      </div>
    );
  }
}

export default Tokbox;
