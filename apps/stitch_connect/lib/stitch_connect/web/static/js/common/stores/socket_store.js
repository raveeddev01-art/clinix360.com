import { observable, action } from "mobx";

class SocketStore {
  @observable isConnected = true;
  isFirstConnect = true;

  constructor(rootStore) {
    this.rootStore = rootStore;
    socket.onOpen(this.openSocket);
    socket.onClose(this.errorSocket);
    socket.onError(this.errorSocket);
    window.addEventListener("online", this.onNetworkOnline);
    window.addEventListener("offline", this.onNetworkOffline);
  }

  get groupChannel() {
    return this.rootStore.channelStore.groupChannel;
  }

  @action
  onNetworkOnline = () => {
    socket.onConnClose();
  };

  @action
  onNetworkOffline = () => {
    this.isConnected = false;
    socket.disconnect();
    socket.reconnectTimer.reset();
  };

  @action
  openSocket = () => {
    this.isConnected = true;

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
