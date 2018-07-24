import ChannelStore from "./channel_store";
import ConversationMessageStore from "./conversation_message_store";
import CurrentPatientStore from "./current_patient_store";
import InboxStore from "./inbox_store";
import NotificationStore from "./notification_store";
import SocketStore from "./socket_store";
import TeamStore from "./team_store";

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
    this.addonStore = {};
    this.uploadStore = {};
    this.billingStore = {};
    this.sidemenuStore = {};
    this.teamFileStore = {};
    this.usersStore = {
      usersById: new Proxy(
        {},
        {
          get: (target, id) => {
            return { id: parseInt(id, 10), full_name: "Anonymous" };
          }
        }
      )
    };
  }

  joinChannels() {
    this.channelStore.joinTeamPatientChannel(patient.team.id);
    this.channelStore.joinEventPatientChannel(patient.id);
  }
}

export default RootPatientStore;
