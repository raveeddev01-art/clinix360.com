import ChannelStore from "./channel_store";
import TeamStore from "./team_store";
import NotificationStore from "./notification_store";
import SocketStore from "./socket_store";
import InboxStore from "./inbox_store";
import CurrentPatientStore from "./current_patient_store";
// import PresenceStore from "./presence_store";

class RootPatientStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);
    this.createStores();

    // when loading is done
    $(".html-loading-element").remove();
    this.joinChannels();
  }

  createStores() {
    this.currentPatientStore = new CurrentPatientStore(this);
    this.teamStore = new TeamStore(this);
    this.channelStore = new ChannelStore(this);
    this.notificationStore = new NotificationStore(this);
    this.socketStore = new SocketStore(this);
    this.inboxStore = new InboxStore(this);
    // this.presenceStore = new PresenceStore(this, this.appParams);
  }

  joinChannels() {
    this.channelStore.joinTeamPatientChannel(patient.team.id);
    this.channelStore.joinEventPatientChannel(patient.id);
  }
}

export default RootPatientStore;
