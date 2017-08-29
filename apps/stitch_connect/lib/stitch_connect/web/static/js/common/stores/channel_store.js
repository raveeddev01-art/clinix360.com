class ChannelStore {
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  join(topic, options = {}) {
    if (this.channels[topic]) {
      this.channels[topic].leave();
    }

    this.channels[topic] = socket.channel(topic, options);

    return this.channels[topic].join();
  }

  get eventChannelTopic() {
    return `events:${currentUser.id}`;
  }

  joinEventChannel(options = {}) {
    const channel = this.join(this.eventChannelTopic, options);

    this.eventChannel.on("new_group", this.rootStore.sidemenuStore.onNewGroup);

    return channel;
  }

  get eventChannel() {
    return this.channels[this.eventChannelTopic];
  }

  joinGroupChannel(options = {}) {
    return this.join(this.rootStore.groupStore.channelTopic, options);
  }

  get groupChannel() {
    return this.channels[this.rootStore.groupStore.channelTopic];
  }

  joinTeamLobbyChannel(options = {}) {
    return this.join(
      this.rootStore.presenceStore.teamLobbyChannelTopic,
      options
    );
  }

  get teamLobbyChannel() {
    return this.channels[this.rootStore.presenceStore.teamLobbyChannelTopic];
  }
}

export default ChannelStore;
