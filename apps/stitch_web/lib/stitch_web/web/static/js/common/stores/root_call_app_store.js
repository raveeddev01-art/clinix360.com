import GroupStore from "./group_store";
import GroupsStore from "./groups_store";
import SidemenuStore from "./sidemenu_store";
import PresenceStore from "./presence_store";
import SocketStore from "./socket_store";
import TeamStore from "./team_store";
import TitleStore from "./title_store";
import UserStore from "./user_store";
import UsersStore from "./users_store";
import CallStore from "./call_store";
import ChannelStore from "./channel_store";

class RootCallAppStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);
    this.isCallWindow = true;
    this.createStores();
    this.onStoreInit();
  }

  createStores() {
    this.groupStore = new GroupStore(this);
    this.groupsStore = new GroupsStore(this);
    this.sidemenuStore = new SidemenuStore(this, this.appParams);
    this.presenceStore = new PresenceStore(this, this.appParams);
    this.socketStore = new SocketStore(this);
    this.teamStore = new TeamStore(this);
    this.titleStore = new TitleStore(this, this.appParams);
    this.userStore = new UserStore(this);
    this.usersStore = new UsersStore(this);
    this.callStore = new CallStore(this);
    this.channelStore = new ChannelStore(this);
    this.notificationStore = {};
    this.invitationStore = {};
    this.inboxStore = {};
  }

  onStoreInit() {
    this.sidemenuStore.loadApp();
    this.channelStore.joinEventChannel();
  }
}

export default RootCallAppStore;
