import AddonStore from "./addon_store";
import GroupStore from "./group_store";
import MessageStore from "./message_store";
import PresenceStore from "./presence_store";
import SidemenuStore from "./sidemenu_store";
import SearchStore from "./search_store";

class RootStore {
  constructor(props) {
    this.addonStore = new AddonStore(this);
    this.groupStore = new GroupStore(this);
    this.messageStore = new MessageStore(this);
    this.presenceStore = new PresenceStore(this);
    this.searchStore = new SearchStore(this);
    this.sidemenuStore = new SidemenuStore(this, props);

    this.presenceStore.connectPresence(props.teamId);

    this.appParams = Object.assign({}, props);
  }
}

export default RootStore;
