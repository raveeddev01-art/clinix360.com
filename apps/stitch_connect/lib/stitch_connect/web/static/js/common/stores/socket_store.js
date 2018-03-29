import { observable, action } from "mobx";

const HEALTHY_TIMEOUT = 5000; // if pong arrives under 5000ms, it means connection is healthy

class SocketStore {
  @observable isConnected = true;
  @observable isHealthy = true;
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
      return;
    }

    this.pingCount += 1;
    this.pingStart = new Date().getTime();

    this.groupChannel.push("ping", { id: this.pingCount }).receive("ok", () => {
      const pingEnd = new Date().getTime();
      clearTimeout(this.pingRace);

      if (pingEnd - this.pingStart < HEALTHY_TIMEOUT) {
        this.isHealthy = true;
        this.sendPingWithTimeout(HEALTHY_TIMEOUT - 1000);
      } else {
        this.isHealthy = false;
        this.sendPingWithTimeout(0); // if it's not healthy immediately check connection again
      }
    });

    this.pingRace = setTimeout(() => {
      this.isHealthy = false;
    }, HEALTHY_TIMEOUT);
  };

  @action
  openSocket = () => {
    this.isConnected = true;
    this.sendPingWithTimeout();

    // upon reconnect, load users, groups, and last batch of messages of current group again
    if (!this.isFirstConnect) {
      this.loadAfterReconnect();
    }

    this.isFirstConnect = false;
  };

  @action
  errorSocket = () => {
    this.isConnected = false;
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
