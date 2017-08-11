import AddonStore from "./addon_store";
import GroupStore from "./group_store";
import MessageStore from "./message_store";
import PresenceStore from "./presence_store";
import SidemenuStore from "./sidemenu_store";

class RootStore {
  constructor(props) {
    this.addonStore = new AddonStore();
    this.groupStore = new GroupStore();
    this.messageStore = new MessageStore();
    this.presenceStore = new PresenceStore();
    this.sidemenuStore = new SidemenuStore(props);

    this.presenceStore.connectPresence(props.teamId);
    this.messageStore.loadMessages();
  }
}

export default RootStore;
