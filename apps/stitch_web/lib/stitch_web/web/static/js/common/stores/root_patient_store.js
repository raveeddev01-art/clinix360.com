import ChannelStore from "./channel_store";
import ConversationMessageStore from "./conversation_message_store";
import CurrentPatientStore from "./current_patient_store";
import InboxStore from "./inbox_store";
import NotificationStore from "./notification_store";
import SocketStore from "./socket_store";
import TeamStore from "./team_store";
import PatientsStore from "./patients_store";
import UploadStore from "./upload_store";
import DesktopStore from "./desktop_store";

class RootPatientStore {
  get apiBasePath() {
    return "/api/v1/patient";
  }

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
    this.conversationMessageStore = new ConversationMessageStore(this);
    this.inboxStore = new InboxStore(this);
    this.patientsStore = new PatientsStore(this);
    this.uploadStore = new UploadStore(this);
    this.desktopStore = new DesktopStore(this);
    this.addonStore = {};
    this.billingStore = {};
    this.groupsStore = {};
    this.sidemenuStore = {};
    this.teamFileStore = {};
    this.usersStore = {};
  }

  joinChannels() {
    this.channelStore.joinTeamPatientChannel(currentPatient.team.id);
    this.channelStore.joinEventPatientChannel(currentPatient.id);
  }
}

export default RootPatientStore;
