import { observable, action } from "mobx";

const HEALTHY_TIMEOUT = 1000; // if pong arrives under 1000ms, it means connection is healthy

class SocketStore {
  @observable isConnected = true;
  @observable reconnectIn = undefined;
  @observable isHealthy = true;
  ticks = 0;
  interval;
  pingCount = 0;
  pingStart = 0;
  pingRace = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.trackConnectionState();
  }

  get groupChannel() {
    return this.rootStore.channelStore.groupChannel;
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
  sendPingWithTimeout = (timeout = 1000) => {
    if (this.isConnected) {
      setTimeout(() => {
        this.sendPing();
      }, timeout);
    }
  };

  @action
  sendPing = () => {
    this.pingCount += 1;
    this.pingStart = new Date().getTime();

    this.groupChannel
      .push("ping", { id: this.pingCount })
      .receive("ok", () => {
        const pingEnd = new Date().getTime();
        clearTimeout(this.pingRace);

        if (pingEnd - this.pingStart < HEALTHY_TIMEOUT) {
          this.isHealthy = true;
          this.sendPingWithTimeout();
        } else {
          this.isHealthy = false;
          this.sendPingWithTimeout(0); // if it's not healthy immediately check connection again
        }
      })
      .receive("timeout", () => {
        this.isHealthy = false;
        this.sendPingWithTimeout();
      });

    this.pingRace = setTimeout(() => {
      this.isHealthy = false;
    }, HEALTHY_TIMEOUT);
  };

  @action
  openSocket = () => {
    this.isConnected = true;
    clearInterval(this.interval);
    this.sendPingWithTimeout();
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
