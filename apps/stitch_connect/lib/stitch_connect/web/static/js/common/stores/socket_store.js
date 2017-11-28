import { observable, action } from "mobx";

class SocketStore {
  @observable isConnected = true;
  @observable reconnectIn = undefined;
  ticks = 0;
  interval;
  pingCount = 0;
  receivedPong = 0;
  pingInterval;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.trackConnectionState();
  }

  get eventChannel() {
    return this.rootStore.channelStore.eventChannel;
  }

  startPingPong = () => {
    this.pingCount = 0;
    this.receivedPong = 0;
    this.pingInterval = setInterval(() => {
      if (this.receivedPong !== this.pingCount) {
        this.errorSocket();
      }

      this.pingCount += 1;
      this.eventChannel
        .push("ping", { id: this.pingCount })
        .receive("ok", resp => {
          this.receivedPong = resp.id;
        })
        .receive("timeout", this.errorSocket);
    }, 1000);
  };

  @action
  reconnect() {
    socket.disconnect(() => socket.connect());
    socket.reconnectTimer.reset();
  }

  trackConnectionState() {
    socket.onOpen(this.openSocket);
    socket.onError(this.errorSocket);
  }

  @action
  tickTimeout = () => {
    this.ticks += 1;
    this.reconnectIn = this.getReconnectIn();
  };

  @action
  openSocket = () => {
    this.isConnected = true;
    clearInterval(this.interval);
    // this.startPingPong();
  };

  @action
  errorSocket = () => {
    if (!this.isConnected) {
      return;
    }

    this.isConnected = false;
    this.ticks = 0;
    socket.reconnectTimer.scheduleTimeout();
    this.reconnectIn = this.getReconnectIn();
    clearInterval(this.interval);
    this.interval = setInterval(this.tickTimeout, 1000);

    clearInterval(this.pingInterval);
  };

  @action
  getReconnectIn = () => {
    const reconnectAfterMs = socket.reconnectAfterMs(
      socket.reconnectTimer.tries + 1
    );
    const reconnectIn = Math.max(0, reconnectAfterMs / 1000 - this.ticks);
    return reconnectIn;
  };
}

export default SocketStore;
