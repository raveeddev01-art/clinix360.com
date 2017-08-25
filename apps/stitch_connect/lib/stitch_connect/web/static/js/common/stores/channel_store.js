class ChannelStore {
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  join(topic) {
    if (this.channels[topic]) {
      this.channels[topic].leave();
    }

    this.channels[topic] = socket.channel(topic);

    return this.channels[topic].join();
  }

  joinGroupChannel() {
    return this.join(this.rootStore.groupStore.channelTopic);
  }

  get groupChannel() {
    return this.channels[this.rootStore.groupStore.channelTopic];
  }
}

export default ChannelStore;
