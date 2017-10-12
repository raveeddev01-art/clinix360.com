import { observable, action } from "mobx";

class SocketStore {
  @observable isConnected = true;
  @observable reconnectIn = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.ticks = 0;
    this.trackConnectionState();
  }

  @action
  reconnect() {
    socket.disconnect(() => socket.connect())
  }

  trackConnectionState() {
    socket.onOpen(this.openSocket.bind(this));
    socket.onError(this.errorSocket.bind(this));
    setInterval(this.tickTimeout.bind(this), 1000);
  }

  tickTimeout() {
    this.reconnectIn = this.getReconnectIn();
    this.ticks += 1;
  }

  openSocket() {
    this.isConnected = true;
    this.ticks = 0;
    this.reconnectIn = this.getReconnectIn();
  }

  errorSocket() {
    this.isConnected = false;
    this.ticks = 0;
    this.reconnectIn = this.getReconnectIn();
  }

  getReconnectIn() {
    let reconnectAfterMs = socket.reconnectAfterMs(socket.reconnectTimer.tries + 1);
    let reconnectIn = (reconnectAfterMs / 1000) - this.ticks;
    return reconnectIn;
  }
}

export default SocketStore;
