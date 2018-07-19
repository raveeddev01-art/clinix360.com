import { getTimezone } from "../../lib/utils";
const noop = () => {};

/**
 * Channel store
 *
 * This store is the central hub for socket channels that are used across the app.
 * All socket channels used in the app MUST be registered in this store.
 */

class ChannelStore {
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /**
   * Joins the channel topic
   *
   * @param {string} topic
   * @param {Object} options
   */
  join(topic, options = {}) {
    this.leave(topic);

    this.channels[topic] = socket.channel(topic, options);

    return this.channels[topic].join();
  }

  /**
   * Leaves the channel topic
   *
   * @param {string} topic
   */
  leave(topic) {
    if (this.channels[topic]) {
      this.channels[topic].leave();

      delete this.channels[topic];
    }
  }

  disconnectAndReload() {
    socket.disconnect(() => window.location.reload(true));
  }

  // ///////////// //
  // Event Channel //
  // ///////////// //
  get eventChannelTopic() {
    return `events:${currentUser.id}`;
  }

  get eventChannel() {
    return this.channels[this.eventChannelTopic];
  }

  eventPatientChannelTopic(patientId) {
    return `events:patient:${patientId}`;
  }

  eventPatientChannel(patientId) {
    return this.channels[this.eventPatientChannelTopic(patientId)];
  }

  joinEventPatientChannel(patientId, options = {}) {
    const topic = this.eventPatientChannelTopic(patientId);
    const joined = this.join(topic, { ...options });
    const eventChannel = this.eventPatientChannel(patientId);

    eventChannel.on("new_app_version", this.disconnectAndReload);
    eventChannel.on("conversation_created", noop);
    eventChannel.on("conversation_updated", noop);

    return joined;
  }

  joinEventChannel(options = {}) {
    const {
      sidemenuStore,
      groupsStore,
      notificationStore,
      presenceStore,
      invitationStore,
      teamFileStore
    } = this.rootStore;
    const joined = this.join(this.eventChannelTopic, options);

    // Message related
    this.eventChannel.on("new_message", sidemenuStore.onNewMessage);

    // Group related
    this.eventChannel.on("created_group", groupsStore.onCreatedGroup);
    this.eventChannel.on("joined_group", groupsStore.onJoinedGroup);
    this.eventChannel.on("left_group", groupsStore.onLeftGroup);
    this.eventChannel.on("renamed_group", groupsStore.onRenamedGroup);
    this.eventChannel.on("deleted_group", groupsStore.onRemovedGroup);
    this.eventChannel.on("hid_group", groupsStore.onHidGroup);
    this.eventChannel.on("marked_as_read", groupsStore.onMarkedAsRead);
    this.eventChannel.on("marked_as_unread", groupsStore.onMarkedAsUnread);
    this.eventChannel.on("members_updated", groupsStore.onMembersUpdated);
    this.eventChannel.on("group_favorite", groupsStore.onFavoriteChanged);
    this.eventChannel.on("upload_comment_added", upload => {
      teamFileStore.onFileUpdate(upload);
    });
    this.eventChannel.on(
      "notification_preference_update",
      notificationStore.onPreferencesLoaded
    );
    this.eventChannel.on("invitation_sent", invitationStore.onInvitationSent);
    this.eventChannel.on(
      "invitation_revoked",
      invitationStore.onInvitationRevoked
    );

    // App related
    this.eventChannel.on("new_app_version", this.disconnectAndReload);
    this.eventChannel.on("logout", presenceStore.onLogout);

    return joined;
  }

  // ///////////// //
  // Group Channel //
  // ///////////// //
  get groupChannelTopic() {
    const { groupStore } = this.rootStore;

    // avoid socket ping error
    if (groupStore.group) {
      return `groups:id:${groupStore.group.id}`;
    }

    return "";
  }

  get groupChannel() {
    return this.channels[this.groupChannelTopic];
  }

  joinGroupChannel(options = {}) {
    const { messageStore, groupStore, teamFileStore } = this.rootStore;

    const joined = this.join(this.groupChannelTopic, options);

    // Message related
    this.groupChannel.on("new_msg", messageStore.onNewMessage);
    this.groupChannel.on("edit_msg", messageStore.onEditMessage);
    this.groupChannel.on("delete_msg", messageStore.onDeleteMessage);
    this.groupChannel.on("starred_message", messageStore.onStarredMessage);
    this.groupChannel.on("pinned_message", messageStore.onPinnedMessage);
    this.groupChannel.on(
      "msg_link_previews_generated",
      messageStore.onLinkPreviewGenerated
    );
    this.groupChannel.on(
      "msg_link_preview_deleted",
      messageStore.onLinkPreviewDeleted
    );
    this.groupChannel.on("reactions_updated", messageStore.onReactionUpdate);
    this.groupChannel.on("read_status_update", messageStore.onReadStatusUpdate);
    this.groupChannel.on("is_typing", groupStore.onStartedTyping);
    this.groupChannel.on(
      "file_comment_edited",
      teamFileStore.onFileCommentEdited
    );
    this.groupChannel.on("file_comment_added", messageStore.onFileCommentAdded);
    this.groupChannel.on(
      "file_comment_added",
      teamFileStore.onFileCommentAdded
    );
    this.groupChannel.on(
      "file_comment_deleted",
      teamFileStore.onFileCommentDeleted
    );
    this.groupChannel.on(
      "file_public_link_updated",
      messageStore.onPublicLinkUpdate
    );
    this.groupChannel.on(
      "file_details_updated",
      messageStore.onFileDetailsUpdate
    );
    this.groupChannel.on(
      "file_details_updated",
      teamFileStore.onFileDetailsUpdate
    );
    this.groupChannel.on("file_deleted", (...args) => {
      messageStore.onFileDeleted(...args);
      teamFileStore.onFileDeleted(...args);
    });
    return joined;
  }

  leaveGroupChannel() {
    this.leave(this.groupChannelTopic);
  }

  // //////////// //
  // Team Channel //
  // //////////// //
  get teamChannelTopic() {
    const { presenceStore } = this.rootStore;

    return `team:lobby:${presenceStore.teamId}`;
  }

  get teamChannel() {
    return this.channels[this.teamChannelTopic];
  }

  teamPatientChannelTopic(teamId) {
    return `team:patient:${teamId}`;
  }

  teamPatientChannel(teamId) {
    return this.channels[this.teamPatientChannelTopic(teamId)];
  }

  joinTeamPatientChannel(teamId, options = {}) {
    const timezone = this.getTimezoneInfo();
    const topic = this.teamPatientChannelTopic(teamId);

    const joined = this.join(topic, { ...options, timezone });

    this.teamPatientChannel(teamId).on(
      "team_renamed",
      this.rootStore.teamStore.onRenamed
    );

    this.teamPatientChannel(teamId).on("team_deleted", noop);

    return joined;
  }

  joinTeamChannel(options = {}) {
    const {
      presenceStore,
      sidemenuStore,
      usersStore,
      patientsStore
    } = this.rootStore;

    const timezone = this.getTimezoneInfo();
    const joined = this.join(this.teamChannelTopic, { ...options, timezone });

    this.teamChannel.on("presence_state", presenceStore.onPresenceState);
    this.teamChannel.on("presence_diff", presenceStore.onPresenceDiff);
    this.teamChannel.on("locked", presenceStore.onLocked);
    this.teamChannel.on("unlocked", presenceStore.onUnlocked);
    this.teamChannel.on(
      "security_lockout_updated",
      presenceStore.onLockoutSettingsLoaded
    );

    this.teamChannel.on("team_renamed", sidemenuStore.onTeamRenamed);
    // this.teamChannel.on("conceal_toggled", ({ conceal_enabled }) => {});
    this.teamChannel.on("team_deleted", presenceStore.logout); // just log out immediately if the team is deleted

    this.teamChannel.on("user_joined", usersStore.onUserJoined);
    this.teamChannel.on("user_info", usersStore.onUserInfo);

    this.teamChannel.on("user_deactivated", usersStore.onUserDeactivated);
    this.teamChannel.on("user_activated", usersStore.onUserActivated);

    this.teamChannel.on("patient_added", patientsStore.onPatientAdded);
    this.teamChannel.on("patient_updated", patientsStore.onPatientUpdated);

    return joined;
  }

  leaveAllChannelsButTeamAndEvent() {
    Object.keys(this.channels)
      .filter(
        topic =>
          topic !== this.teamChannelTopic && topic !== this.eventChannelTopic
      )
      .forEach(topic => {
        this.leave(topic);
      });
  }

  getTimezoneInfo() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60;
    return {
      tz: getTimezone(),
      tz_offset: offset
    };
  }
}

export default ChannelStore;
