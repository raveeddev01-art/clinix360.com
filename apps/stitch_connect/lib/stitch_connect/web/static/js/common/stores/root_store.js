import AddonStore from "./addon_store";
import ChannelStore from "./channel_store";
import GroupStore from "./group_store";
import MessageStore from "./message_store";
import PresenceStore from "./presence_store";
import SidemenuStore from "./sidemenu_store";
import SearchStore from "./search_store";
import GlobalStarredMessageStore from "./global_starred_message_store";
import UploadStore from "./upload_store";

class RootStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);

    // Init stores
    this.addonStore = new AddonStore(this);
    this.channelStore = new ChannelStore(this);
    this.groupStore = new GroupStore(this);
    this.messageStore = new MessageStore(this);
    this.presenceStore = new PresenceStore(this, props);
    this.searchStore = new SearchStore(this);
    this.sidemenuStore = new SidemenuStore(this, props);
    this.globalStarredMessageStore = new GlobalStarredMessageStore(this);
    this.uploadStore = new UploadStore(this);

    // Join channels
    this.presenceStore.joinTeamLobbyChannel();
  }
}

export default RootStore;
