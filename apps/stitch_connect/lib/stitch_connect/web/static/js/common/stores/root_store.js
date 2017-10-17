// Admin stores
import ImageStore from "./image_store";
import InvitationStore from "./invitation_store";
import MembersStore from "./members_store";
import NotificationStore from "./notification_store";
import TeamStore from "./team_store";
import UserStore from "./user_store";

// Client stores
import AddonStore from "./addon_store";
import ChannelStore from "./channel_store";
import FilesStore from "./files_store";
import GroupPresenceStore from "./group_presence_store";
import GlobalStarredMessageStore from "./global_starred_message_store";
import GroupStore from "./group_store";
import MessageStore from "./message_store";
import PresenceStore from "./presence_store";
import SearchStore from "./search_store";
import SidemenuStore from "./sidemenu_store";
import SocketStore from "./socket_store";
import UploadStore from "./upload_store";

class RootStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);

    // Init admin stores
    this.imageStore = new ImageStore(this);
    this.invitationStore = new InvitationStore(this);
    this.membersStore = new MembersStore(this);
    this.notificationStore = new NotificationStore(this);
    this.teamStore = new TeamStore(this);
    this.userStore = new UserStore(this);

    // Init client stores
    this.addonStore = new AddonStore(this);
    this.channelStore = new ChannelStore(this);
    this.globalStarredMessageStore = new GlobalStarredMessageStore(this);
    this.filesStore = new FilesStore(this);
    this.groupPresenceStore = new GroupPresenceStore(this);
    this.groupStore = new GroupStore(this);
    this.messageStore = new MessageStore(this);
    this.presenceStore = new PresenceStore(this, props);
    this.searchStore = new SearchStore(this);
    this.sidemenuStore = new SidemenuStore(this, props);
    this.socketStore = new SocketStore(this);
    this.uploadStore = new UploadStore(this);

    // Initial actions for admin stores
    this.notificationStore.loadPreferences();
    this.membersStore.loadUsers(props.teamId);
    this.teamStore.loadTeam(props.teamId);
    this.userStore.loadUser(currentUser.id);

    // Join channels
    this.channelStore.joinEventChannel();
    this.presenceStore.joinTeamLobbyChannel();
  }
}

export default RootStore;
