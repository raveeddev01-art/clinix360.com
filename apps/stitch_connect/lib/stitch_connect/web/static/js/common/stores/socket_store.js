import { observable, action } from "mobx";

class SocketStore {
  @observable isConnected = true;
  @observable reconnectIn = undefined;
  ticks = 0;
  interval;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.trackConnectionState();
  }

  @action
  reconnect() {
    socket.disconnect(() => socket.connect());
    socket.reconnectTimer.reset();
  }

  trackConnectionState() {
    socket.onOpen(this.openSocket);
    socket.onReconnectScheduled(this.errorSocket);
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
  };

  @action
  errorSocket = () => {
    this.isConnected = false;
    this.ticks = 0;
    this.reconnectIn = this.getReconnectIn();
    clearInterval(this.interval);
    this.interval = setInterval(this.tickTimeout, 1000);
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
