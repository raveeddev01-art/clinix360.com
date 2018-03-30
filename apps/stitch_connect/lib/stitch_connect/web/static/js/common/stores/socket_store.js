import { observable, action } from "mobx";

// if pong arrives under timeout, it means connection is healthy
const HEALTHY_CONNECTED_TIMEOUT = 5000; // used while connected
const HEALTHY_DISCONNECTED_TIMEOUT = 1000; // used while disconnected

class SocketStore {
  @observable isConnected = true;
  @observable isHealthy = true;
  healthyTimeoutMs = HEALTHY_DISCONNECTED_TIMEOUT;
  isFirstConnect = true;
  pingCount = 0;
  pingStart = 0;
  pingRace = null;
  pingTimeout = null;

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
  sendPingWithTimeout = (delay = 1000) => {
    if (this.isConnected) {
      clearTimeout(this.pingRace);
      clearTimeout(this.pingTimeout);
      this.pingTimeout = setTimeout(() => {
        this.sendPing();
      }, delay);
    }
  };

  @action
  sendPing = () => {
    if (!this.groupChannel) {
      socket.log("stitch", "Group channel is not there. Try checking again after 1s");
      // if channel is not open yet, try again after 1s
      this.sendPingWithTimeout();
      return;
    }

    this.pingCount += 1;
    this.pingStart = new Date().getTime();

    socket.log("stitch", "Sending health check ping");
    this.groupChannel.push("ping", { id: this.pingCount }).receive("ok", () => {
      const pingEnd = new Date().getTime();
      clearTimeout(this.pingRace);

      if (pingEnd - this.pingStart < this.healthyTimeoutMs) {
        socket.log("stitch", `HEALTHY! Took ${pingEnd - this.pingStart}ms`);
        this.isHealthy = true;
        this.healthyTimeoutMs = HEALTHY_CONNECTED_TIMEOUT;
        this.sendPingWithTimeout(this.healthyTimeoutMs - 1000);
      } else {
        socket.log("stitch", `UNHEALTHY! Took ${pingEnd - this.pingStart}ms`);
        this.isHealthy = false;
        this.healthyTimeoutMs = HEALTHY_DISCONNECTED_TIMEOUT;
        this.sendPingWithTimeout(0); // if it's not healthy immediately check connection again
      }
    });

    this.pingRace = setTimeout(() => {
      socket.log("stitch", `PING RACE timeout after ${this.healthyTimeoutMs}ms, try healthy check again`);
      this.isHealthy = false;
      this.healthyTimeoutMs = HEALTHY_DISCONNECTED_TIMEOUT;
      // if it is unhealthy try healthy check immediately
      this.sendPingWithTimeout(0);
    }, this.healthyTimeoutMs);
  };

  @action
  openSocket = () => {
    this.isConnected = true;
    this.healthyTimeoutMs = HEALTHY_DISCONNECTED_TIMEOUT;
    this.sendPingWithTimeout();

    // upon reconnect, load users, groups, and last batch of messages of current group again
    if (!this.isFirstConnect) {
      socket.log("stitch", "Reloading after reconnect");
      this.loadAfterReconnect();
    }

    this.isFirstConnect = false;
  };

  @action
  errorSocket = () => {
    this.isConnected = false;
    clearTimeout(this.pingRace);
    clearTimeout(this.pingTimeout);
  };

  @action
  loadAfterReconnect = () => {
    const { usersStore, groupsStore } = this.rootStore;
    if (!groupsStore.currentGroup) {
      return;
    }

    const prevUnreadAt = groupsStore.currentGroup.last_read_at;
    const prevUnreadCount = groupsStore.currentGroup.unread_messages_count;

    usersStore
      .loadUsers()
      .then(() => groupsStore.loadGroups())
      .then(() => {
        if (!this.groupChannel || !groupsStore.currentGroup) {
          return;
        }

        const newUnreadAt = groupsStore.currentGroup.last_read_at;
        const newUnreadCount = groupsStore.currentGroup.unread_messages_count;

        if (
          prevUnreadAt !== newUnreadAt ||
          prevUnreadCount !== newUnreadCount
        ) {
          groupsStore.onOpenedGroup();
        }
      });
  };
}

export default SocketStore;
