/**
 * User store
 *
 * This store keeps track of data of current logged in user
 */

import { observable, action, computed } from "mobx";
import BrowserWindow from "../../util/windows";
import { callingModal } from "../modals";

class CallStore {
  @observable isDM = false;
  @observable credentials = {};
  @observable connected = false;
  @observable status = "ringing";
  dismissCallingModal = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    const { call = {} } = rootStore.appParams;
    this.credentials = {
      token: call.token,
      apiKey: call.apiKey,
      sessionId: call.sessionId
    };
    this.isDM = call.isDM;
    this.status = call.status;
    this.groupId = call.groupId;
    this.callerId = call.callerId;
    this.onIncomingCall = this.onIncomingCall.bind(this);
    this.onDeclinedCall = this.onDeclinedCall.bind(this);
    this.onDismissCall = this.onDismissCall.bind(this);
  }

  @computed
  get isActiveCall() {
    return ["ringing", "talking"].includes(this.status);
  }

  @action
  setConnected(to = true) {
    this.connected = to;
  }

  @action
  missedCall() {
    this.status = "missed";
  }

  onIncomingCall(data) {
    if (this.rootStore.isCallWindow || this.dismissCallingModal) {
      return false;
    }

    const { usersStore } = this.rootStore;

    return callingModal({
      user: usersStore.getUserById(data.caller_id),
      setDisimssReference: dismiss => {
        this.dismissCallingModal = dismiss;
      }
    }).then(
      () => {
        this.dismissCallingModal = false;
        BrowserWindow.open(`/call/${data.hash}`, { name: "calling" });
      },
      () => {
        this.dismissCallingModal = false;
        post(`/api/v1/call/decline/${data.hash}`);
      }
    );
  }

  onDeclinedCall() {
    if (this.rootStore.isCallWindow) {
      this.isActiveCall = false;
      this.status = "declined";
    }
  }

  onDismissCall() {
    if (this.dismissCallingModal) {
      this.dismissCallingModal();
      this.dismissCallingModal = false;
    }
  }
}

export default CallStore;
